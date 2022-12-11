import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';

export const privateRoutes = () => {
  const router = Router();

  router.use(authMiddleware);

  router.get('/', (_, res) => {
    res.json({ message: 'Hello from private route!' });
  });

  return router;
};
