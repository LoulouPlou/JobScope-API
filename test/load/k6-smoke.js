import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const PASSWORD = 'Password123!';

function registerAndLogin(vu) {
  const email = `k6-${vu}-${Date.now()}@example.com`;

  const register = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({
      email,
      password: PASSWORD,
      firstName: 'Load',
      lastName: 'Test',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(register, {
    'register ok/409': r => r.status === 201 || r.status === 409,
  });

  const login = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, password: PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(login, { 'login 200': r => r.status === 200 });
  const body = login.json();
  const token = body?.token?.token || body?.token;
  return { token, email };
}

export const options = {
  scenarios: {
    smoke: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '15s', target: 5 },
        { duration: '30s', target: 5 },
        { duration: '15s', target: 0 },
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

export default function () {
  const { token } = registerAndLogin(__VU);
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // jobs
  check(http.get(`${BASE_URL}/api/jobs/recent`), {
    'recent 200': r => r.status === 200,
  });
  const searchRes = http.get(`${BASE_URL}/api/jobs/search?limit=5&page=1`);
  check(searchRes, {
    'search 200': r => r.status === 200,
  });

  // analytics
  check(http.get(`${BASE_URL}/api/analytics/dashboard/domain/Web`), {
    'dashboard domain 200': r => r.status === 200,
  });
  check(http.get(`${BASE_URL}/api/analytics/dashboard/overview`), {
    'dashboard overview 200': r => r.status === 200,
  });

  // favorites (protected)
  const recent = http.get(`${BASE_URL}/api/jobs/recent`).json();
  const search = searchRes.json();
  const jobId =
    recent?.[0]?._id ||
    search?.items?.[0]?._id ||
    search?.[0]?._id;

  if (jobId) {
    check(http.post(`${BASE_URL}/api/favorites/${jobId}`, null, authHeaders), {
      'add favorite 201/400': r => r.status === 201 || r.status === 400,
    });
    const favRes = http.get(`${BASE_URL}/api/favorites?page=1&limit=5`, authHeaders);
    check(favRes, {
      'favorites list 200': r => r.status === 200,
      'favorites payload has items': r => Array.isArray(r.json()?.items),
    });
  }

  sleep(1);
}
