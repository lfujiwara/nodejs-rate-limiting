import { createClient } from 'redis';
import { envConfig } from '../config/env-config';

const main = async () => {
  const redis = createClient({
    url: envConfig.redisRateLimitingUrl,
  });
  await redis.connect();
  await redis.flushAll();

  process.exit(0);
};

if (require.main === module) {
  main();
}
