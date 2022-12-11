import express from 'express';
import { privateRoutes } from './routes/private-routes';
import { publicRoutes } from './routes/public-routes';

export const makeApp = () => {
  const app = express();
  app.use(express.json());

  app.use('/public', publicRoutes());
  app.use('/private', privateRoutes());

  return app;
};
