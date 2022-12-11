import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import { ExpressMiddleware } from '../middlewares/types';

export const privateRoutes = (throttler?: ExpressMiddleware) => {
  const router = Router();
  router.use(authMiddleware);

  if (throttler) router.use(throttler);

  router.get('/', (_, res) => {
    res.json({ message: 'Hello from private route!' });
  });

  return router;
};
