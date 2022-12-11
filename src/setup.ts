import { createClient, RedisClientType } from 'redis';
import { envConfig } from './config/env-config';

export type SetupResult = {
  rateLimitingRedis: RedisClientType;
  teardown: () => Promise<void>;
};
export const setup = async (): Promise<SetupResult> => {
  const rateLimitingRedis: RedisClientType = createClient({
    url: envConfig.redisRateLimitingUrl,
  });
  await rateLimitingRedis.connect();

  return {
    rateLimitingRedis,
    // Just in case this is necessary
    teardown: async () => {
      await Promise.all([rateLimitingRedis.disconnect()]);
    },
  };
};
