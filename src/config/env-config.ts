import { config } from 'dotenv';
config();

export interface EnvConfig {
  privateRoutesSecret: string;
  redisRateLimitingUrl: string;
  logThrottlingInfo?: boolean;
  maxRequestsPerHourOnPrivateRoutes: number;
  maxRequestsPerHourOnPublicRoutes: number;
}

export const envConfig: EnvConfig = {
  privateRoutesSecret:
    process.env.PRIVATE_ROUTES_SECRET || '61D19E59-B95F-480A-930F-B4480BC96AE2',
  redisRateLimitingUrl:
    process.env.REDIS_RATE_LIMITING_URL || 'redis://localhost:6379',
  logThrottlingInfo: process.env.LOG_THROTTLING_INFO === 'true',
  maxRequestsPerHourOnPrivateRoutes: parseInt(
    process.env.MAX_REQUESTS_PER_HOUR_ON_PRIVATE_ROUTES || '200',
    10,
  ),
  maxRequestsPerHourOnPublicRoutes: parseInt(
    process.env.MAX_REQUESTS_PER_HOUR_ON_PUBLIC_ROUTES || '100',
    10,
  ),
};
