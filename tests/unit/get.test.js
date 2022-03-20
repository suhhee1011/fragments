// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });
  test('Get all fragments list of authenticated users', async () => {
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('Authenticated requests of post and get/:id', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Hi, This is test');

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
  });

  test('Authenticated requests of post and get/:id.ext', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('README.md');

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id + '.html')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
  });

  test('Authenticated requests of post and get/:id/:info', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('README.md');

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id + '/info')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
  });

  test('authenticated requests get with wrong id', async () => {
    const res = await request(app).get('/v1/fragments/123').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });
});
