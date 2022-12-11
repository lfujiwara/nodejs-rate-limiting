import express from 'express';
import { privateRoutes } from './routes/private-routes';
import { publicRoutes } from './routes/public-routes';
import { ThrottlerFactory } from './services/throttler';

export const makeApp = (throttlerFactory?: ThrottlerFactory) => {
  const app = express();
  app.use(express.json());

  app.use('/public', publicRoutes(throttlerFactory));
  app.use('/private', privateRoutes(throttlerFactory));

  return app;
};
