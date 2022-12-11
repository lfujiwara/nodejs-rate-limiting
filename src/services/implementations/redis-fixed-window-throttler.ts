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

export const makeRedisFixedWindowThrottler = (
  config: ThrottlerOptions & { redis: RedisClientType; throttlerId?: string },
): Throttler => {
  const { redis } = config;
  const makeConsumerKey = (id: string, timeWindowKey: string) =>
    `${config.throttlerId}:${id}:${timeWindowKey}`;

  return async (id, weight = 1) => {
    const timeWindow = getTimeWindow();
    const key = makeConsumerKey(id, timeWindow.key);
    const pmKey = `${key}:${process.env.pm_id || 'node'}`;

    const [countStr] = await redis
      .multi()
      .get(key)
      .incrBy(key, weight)
      .expire(key, timeWindow.expire)
      .exec();
    const prevCount = countStr ? parseInt(countStr.toString(), 10) : 0;

    if (prevCount + weight > config.maxRequestsPerHour) {
      await redis
        .multi()
        .decrBy(key, weight)
        .incrBy(`throttled:${pmKey}`, weight)
        .exec();

      if (envConfig.logThrottlingInfo)
        console.warn('Throttled request', {
          id,
          prevCount,
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

    await redis.incrBy(`allowed:${pmKey}`, weight);
    return [true, null];
  };
};
