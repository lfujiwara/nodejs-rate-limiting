import { Request, Router } from 'express';
import { envConfig } from '../config/env-config';
import { makeThrottlingMiddleware } from '../middlewares/throttling-middleware';
import { ThrottlerFactory } from '../services/throttler';

export const publicRoutes = (throttlerFactory?: ThrottlerFactory) => {
  const router = Router();

  if (throttlerFactory) {
    const idExtractor = (req: Request) => req.socket.remoteAddress;
    const throttler = throttlerFactory({
      maxRequestsPerHour: envConfig.maxRequestsPerHourOnPublicRoutes,
      throttlerId: 'private-routes',
    });

    router.get('/', makeThrottlingMiddleware(idExtractor, throttler, 1));
  }

  router.get('/', (_, res) => {
    res.json({ message: 'Hello from public route!' });
  });

  return router;
};
