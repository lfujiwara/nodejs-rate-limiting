import { RedisClientType } from 'redis';
import { envConfig } from '../../config/env-config';
import { Throttler, ThrottlerOptions } from '../throttler';

type TimeWindow = {
  key: string;
  expire: number;
  next: Date;
};

const getTimeWindow = () => {
  const date = new Date();
  const next = new Date();
  next.setHours(date.getHours() + 1);
  next.setMinutes(0);
  next.setSeconds(0);
  next.setMilliseconds(0);

  return {
    key: date.toISOString().slice(0, 13),
    expire: 3600 - date.getMinutes() * 60 - date.getSeconds(),
    next,
  } as TimeWindow;
};

const makeConsumerKey = (id: string, timeWindowKey: string) =>
  `${id}:${timeWindowKey}`;

export const makeRedisFixedWindowThrottler = async (
  config: ThrottlerOptions & { redis: RedisClientType },
): Promise<Throttler> => {
  const { redis } = config;

  const countCalls = (window: TimeWindow, id: string) =>
    redis
      .get(makeConsumerKey(id, window.key))
      .then((res) => (res ? parseInt(res, 10) : 0));

  const placeCall = (window: TimeWindow, id: string, weight: number) => {
    const key = makeConsumerKey(id, window.key);
    return redis.multi().incrBy(key, weight).expire(key, window.expire);
  };

  return async (id) => {
    const timeWindow = getTimeWindow();

    const multi = placeCall(timeWindow, id, 1);
    const count = await countCalls(timeWindow, id);

    if (count >= config.maxRequestsPerHour) {
      if (envConfig.logThrottlingInfo)
        console.warn('Throttled request', {
          id,
          count,
          limit: config.maxRequestsPerHour,
        });
      return [
        false,
        {
          limit: config.maxRequestsPerHour,
          nextAttempt: timeWindow.next,
        },
      ];
    }

    await multi.exec();

    if (envConfig.logThrottlingInfo)
      console.log('Allowed request', {
        id,
        count,
        limit: config.maxRequestsPerHour,
      });
    return [true, null];
  };
};
