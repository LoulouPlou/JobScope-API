//import request from 'supertest';
//import app from '../../app';
//import { setupTestDB, cleanupTestDB, teardownTestDB } from '../../utils/db';
// describe('Jobs integration tests', () => {
//   beforeAll(async () => {
//     await setupTestDB();
//   });

//   afterEach(async () => {
//     await cleanupTestDB();
//   });

//   afterAll(async () => {
//     await teardownTestDB();
//   });

//   it('GET /jobs should return 200 and an array', async () => {
//     const res = await request(app).get('/jobs');

//     expect(res.status).toBe(200);
//   });
// });
