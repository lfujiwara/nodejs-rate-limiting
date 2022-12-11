import { NextFunction, Request, Response } from 'express';
import { Throttler } from '../services/throttler';
import { ExpressMiddleware } from './types';

export const makeThrottlingMiddleware = (
  idExtractor: (req: Request) => string,
  throttler: Throttler,
  weight = 1,
) =>
  ((req: Request, res: Response, next: NextFunction) => {
    throttler(idExtractor(req), weight)
      .then(([allowed, throttleDetails]) => {
        if (allowed) next();
        else
          res
            .status(429)
            .json({ error: 'Too many requests', ...throttleDetails });
      })
      .catch((err) => {
        console.error('throttling-middleware', err);
        res.status(500).json({ error: 'Internal server error' });
      });
  }) as ExpressMiddleware;
