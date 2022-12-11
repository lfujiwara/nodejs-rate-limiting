import express from 'express';
import { ExpressMiddleware } from './middlewares/types';
import { privateRoutes } from './routes/private-routes';
import { publicRoutes } from './routes/public-routes';

export const makeApp = (
  publicRoutesThrottler?: ExpressMiddleware,
  privateRoutesThrottler?: ExpressMiddleware,
) => {
  const app = express();
  app.use(express.json());

  app.use('/public', publicRoutes(publicRoutesThrottler));
  app.use('/private', privateRoutes(privateRoutesThrottler));

  return app;
};
