const request = require('supertest');

const app = require('../../src/app');
const API_URL = process.env.API_URL;

describe('PUT /v1/fragments', () => {
  test('Authenticated requests', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Hi, This is test');
    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.status).toBe('ok');
    expect(postRes.body.fragment.type).toBe('text/plain');
    expect(postRes.header.location).toBe(`${API_URL}/v1/fragments/${postRes.body.fragment.id}`);
    const postId = postRes.body.fragment.id;

    const putRes = await request(app)
      .put('/v1/fragments/' + postRes.body.fragment.id)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Hi, it is changed text');
    expect(putRes.statusCode).toBe(200);
    expect(putRes.body.status).toBe('ok');
    expect(postRes.body.fragment.type).toBe('text/plain');
    expect(putRes.header.location).toBe(`${API_URL}/v1/fragments/${putRes.body.fragment.id}`);
    expect(putRes.body.fragment.id).toBe(postId);
  });
  test('unauthenticated requests are denied', async () => {
    const res = await request(app)
      .put('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .send('hi');
    expect(res.statusCode).toBe(401);
  });
  test('notSameType with original fragment', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Hi, This is test');
    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.status).toBe('ok');
    expect(postRes.body.fragment.type).toBe('text/plain');
    expect(postRes.header.location).toBe(`${API_URL}/v1/fragments/${postRes.body.fragment.id}`);

    const putRes = await request(app)
      .put('/v1/fragments/' + postRes.body.fragment.id)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')
      .send('<h1>Hi, it is html</h1>');
    expect(putRes.statusCode).toBe(400);
  });
});
