// tests/unit/post.test.js

const request = require('supertest');

const app = require('../../src/app');
const API_URL = process.env.API_URL;

describe('POST /v1/fragments', () => {
  test('Authenticated requests', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Hi, This is test');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.header.location).toBe(`https://${API_URL}/v1/fragments/${res.body.fragment.id}`);
  });
  test('unauthenticated requests are denied', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .send('hi');
    expect(res.statusCode).toBe(401);
  });
  test('UnexpectedType', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png')
      .send('Hi, This is test');
    expect(res.status).toBe(415);
    expect(res.body.status).toBe('error');
  });
});
