import { makeApp } from './app';
import { envConfig } from './config/env-config';
import { makeThrottlingMiddleware } from './middlewares/throttling-middleware';
import { makeRedisFixedWindowThrottler } from './services/implementations/redis-fixed-window-throttler';
import { setup } from './setup';

const main = async () => {
  const { rateLimitingRedis, teardown } = await setup();

  const publicRoutesThrottler = await makeRedisFixedWindowThrottler({
    maxRequestsPerHour: envConfig.maxRequestsPerHourOnPublicRoutes,
    redis: rateLimitingRedis,
  });
  const privateRoutesThrottler = await makeRedisFixedWindowThrottler({
    maxRequestsPerHour: envConfig.maxRequestsPerHourOnPrivateRoutes,
    redis: rateLimitingRedis,
  });

  const app = makeApp(
    makeThrottlingMiddleware(
      (req) => req.socket.remoteAddress,
      publicRoutesThrottler,
    ),
    makeThrottlingMiddleware(
      (req) => req.headers.authorization,
      privateRoutesThrottler,
    ),
  );

  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
};

main();
