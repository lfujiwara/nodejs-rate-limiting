import { Router } from 'express';

export const publicRoutes = () => {
  const router = Router();

  router.get('/', (_, res) => {
    res.json({ message: 'Hello from public route!' });
  });

  return router;
};
