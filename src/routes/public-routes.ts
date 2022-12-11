import { Router } from 'express';
import { ExpressMiddleware } from '../middlewares/types';

export const publicRoutes = (throttler?: ExpressMiddleware) => {
  const router = Router();

  if (throttler) router.use(throttler);

  router.get('/', (_, res) => {
    res.json({ message: 'Hello from public route!' });
  });

  return router;
};
