/**
 * @param id - The id of the requester
 * @returns A promise that resolves to true if the request is allowed, false otherwise
 */
export type Throttler = (
  id: string,
  weight?: number,
) => Promise<[true, null] | [false, { limit: number; nextAttempt: Date }]>;

export type ThrottlerOptions = {
  maxRequestsPerHour: number;
  throttlerId: string;
};

export type ThrottlerFactory = (options: ThrottlerOptions) => Throttler;
