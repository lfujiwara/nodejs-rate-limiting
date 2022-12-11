import { NextFunction, Request, Response } from 'express';
import { envConfig } from '../config/env-config';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requesterId = req.headers['authorization'];

  if (!requesterId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (requesterId !== envConfig.privateRoutesSecret) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  next();
};
