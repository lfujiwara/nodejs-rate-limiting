import * as request from 'supertest';

describe('Route responses', () => {
  let app: Express.Application;

  /**
   * Setup environment variables for testing
   */
  const wrongSecret = 'incorrect';
  const correctSecret = 'correct';
  process.env.PRIVATE_ROUTES_SECRET = correctSecret;

  beforeEach(() => {
    // eslint-disable-next-line
    app = require('../src/app').makeApp();
  });

  const weights = ['', 2, 5, 10, 50, 100];

  weights.forEach((weight) => {
    it(`should return 200 status and 'Hello from public route!' when GET /public/${weight} is called`, async () => {
      await request
        .agent(app)
        .get('/public')
        .expect({ message: 'Hello from public route!' })
        .expect(200);
    });

    it(`should return 401 status and 'Unauthorized' when GET /private/${weight} is called without an authorization header`, async () => {
      await request
        .agent(app)
        .get('/private')
        .expect({ message: 'Unauthorized' })
        .expect(401);
    });

    it(`should return 403 status and 'Forbidden' when GET /private/${weight} is called with the incorrect authorization header`, async () => {
      await request
        .agent(app)
        .get('/private')
        .set('Authorization', wrongSecret)
        .expect({ message: 'Forbidden' })
        .expect(403);
    });

    it(`should return 200 status and 'Hello from private route!' when GET /private/${weight} is called with the correct authorization header`, async () => {
      await request
        .agent(app)
        .get('/private')
        .set('Authorization', correctSecret)
        .expect({ message: 'Hello from private route!' })
        .expect(200);
    });
  });
});
