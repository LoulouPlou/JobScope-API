import request from 'supertest';
import app from '../../src/app';
import { setupIntegrationTestDB, createAuthenticatedUser } from './testUtils';
import { JobModel } from '../../src/models/job.model';

jest.setTimeout(90000);

setupIntegrationTestDB();

describe('Favorites', () => {
  it('requires authentication to access favorites', async () => {
    const res = await request(app).get('/api/favorites');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('AUTH_REQUIRED');
  });

  it('adds and removes a favorite job for the user', async () => {
    const { token, user } = await createAuthenticatedUser();
    const job = await JobModel.findOne();

    const addRes = await request(app)
      .post(`/api/favorites/${job?._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(addRes.status).toBe(201);
    expect(addRes.body.userId).toBe(String(user?._id));
    expect(addRes.body.jobId).toBe(String(job?._id));

    const removeRes = await request(app)
      .delete(`/api/favorites/${job?._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(removeRes.status).toBe(204);
  });

  it('prevents adding the same job to favorites twice', async () => {
    const { token } = await createAuthenticatedUser();
    const job = await JobModel.findOne();

    await request(app).post(`/api/favorites/${job?._id}`).set('Authorization', `Bearer ${token}`);

    const duplicateRes = await request(app)
      .post(`/api/favorites/${job?._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(duplicateRes.status).toBe(400);
    expect(duplicateRes.body.code).toBe('FAVORITE_ALREADY_EXISTS');
  });

  it('returns 404 when removing a non-existent favorite', async () => {
    const { token } = await createAuthenticatedUser();
    const job = await JobModel.findOne();

    const res = await request(app)
      .delete(`/api/favorites/${job?._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('FAVORITE_NOT_FOUND');
  });

  it('lists favorites with pagination and job info', async () => {
    const { token } = await createAuthenticatedUser();
    const job = await JobModel.findOne();

    await request(app).post(`/api/favorites/${job?._id}`).set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/favorites?page=1&limit=5')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
    expect(res.body.total).toBeGreaterThan(0);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items[0]).toMatchObject({
      _id: expect.any(String),
      title: expect.any(String),
      company: expect.any(String),
      location: expect.any(String),
      isFavorite: true,
    });
  });
});
