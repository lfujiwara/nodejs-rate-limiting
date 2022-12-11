import { makeApp } from './app';
import { makeRedisFixedWindowThrottler } from './services/implementations/redis-fixed-window-throttler';
import { ThrottlerFactory } from './services/throttler';
import { setup } from './setup';

const main = async () => {
  const { rateLimitingRedis } = await setup();

  const throttlerFactory: ThrottlerFactory = (options) =>
    makeRedisFixedWindowThrottler({
      redis: rateLimitingRedis,
      ...options,
    });

  const app = makeApp(throttlerFactory);

  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
};

main();
