import request from 'supertest';
import app from '../../app';

describe('Root endpoint', () => {
  it('GET / should return welcome message', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.text).toBe('Welcome to the JobScope API');
  });
});
