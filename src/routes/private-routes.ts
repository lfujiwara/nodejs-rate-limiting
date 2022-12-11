import { Request, Router } from 'express';
import { envConfig } from '../config/env-config';
import { authMiddleware } from '../middlewares/auth-middleware';
import { makeThrottlingMiddleware } from '../middlewares/throttling-middleware';
import { ThrottlerFactory } from '../services/throttler';

const weights = [2, 5, 10, 50, 100];

export const privateRoutes = (throttlerFactory?: ThrottlerFactory) => {
  const router = Router();
  router.use(authMiddleware);

  if (throttlerFactory) {
    const idExtractor = (req: Request) => req.socket.remoteAddress;
    const throttler = throttlerFactory({
      maxRequestsPerHour: envConfig.maxRequestsPerHourOnPrivateRoutes,
      throttlerId: 'public-routes',
    });

    router.get('/', makeThrottlingMiddleware(idExtractor, throttler, 1));
    weights.forEach((weight) =>
      router.get(
        `/${weight}`,
        makeThrottlingMiddleware(idExtractor, throttler, weight),
      ),
    );
  }

  router.get('/', (_, res) => {
    res.json({ message: 'Hello from private route!' });
  });
  weights.forEach((weight) =>
    router.get(`/${weight}`, (_, res) => {
      res.json({ message: `Hello from private route with weight ${weight}!` });
    }),
  );

  return router;
};
