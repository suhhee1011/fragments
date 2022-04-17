// tests/unit/post.test.js

const request = require('supertest');

const app = require('../../src/app');
const API_URL = process.env.API_URL;
const fs = require('fs');
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
    expect(res.header.location).toBe(`${API_URL}/v1/fragments/${res.body.fragment.id}`);
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
      .set('Content-Type', 'image/mp4')
      .send('Hi, This is test');
    expect(res.status).toBe(415);
    expect(res.body.status).toBe('error');
  });

  test('Authenticated requests of post md ', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# This is markdown');

    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.status).toBe('ok');
    expect(postRes.body.fragment.type).toBe('text/markdown');
    expect(postRes.header.location).toBe(`${API_URL}/v1/fragments/${postRes.body.fragment.id}`);
  });

  test('Authenticated requests of post html ', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')
      .send('<h1>Hi I am html</h1>');

    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.status).toBe('ok');
    expect(postRes.body.fragment.type).toBe('text/html');
    expect(postRes.header.location).toBe(`${API_URL}/v1/fragments/${postRes.body.fragment.id}`);
  });

  test('Authenticated requests of post json', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send('{firstName:"suhhee", lastName: "Kim" }');

    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.status).toBe('ok');
    expect(postRes.body.fragment.type).toBe('application/json');
    expect(postRes.header.location).toBe(`${API_URL}/v1/fragments/${postRes.body.fragment.id}`);
  });
  test('Authenticated requests of post png', async () => {
    const file = fs.readFileSync('tests/unit/test.png');
    const blob = Buffer.from(file);

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png')
      .send(blob);

    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.status).toBe('ok');
    expect(postRes.body.fragment.type).toBe('image/png');
    expect(postRes.header.location).toBe(`${API_URL}/v1/fragments/${postRes.body.fragment.id}`);
  });

  test('Authenticated requests of post jpeg', async () => {
    const file = fs.readFileSync('tests/unit/test.png');
    const blob = Buffer.from(file);

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/jpeg')
      .send(blob);

    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.status).toBe('ok');
    expect(postRes.body.fragment.type).toBe('image/jpeg');
    expect(postRes.header.location).toBe(`${API_URL}/v1/fragments/${postRes.body.fragment.id}`);
  });

  test('Authenticated requests of post webp', async () => {
    const file = fs.readFileSync('tests/unit/sample.webp');
    const blob = Buffer.from(file);

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/webp')
      .send(blob);

    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.status).toBe('ok');
    expect(postRes.body.fragment.type).toBe('image/webp');
    expect(postRes.header.location).toBe(`${API_URL}/v1/fragments/${postRes.body.fragment.id}`);
  });
  test('Authenticated requests of post gif', async () => {
    const file = fs.readFileSync('tests/unit/sample.gif');
    const blob = Buffer.from(file);

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/gif')
      .send(blob);

    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.status).toBe('ok');
    expect(postRes.body.fragment.type).toBe('image/gif');
    expect(postRes.header.location).toBe(`${API_URL}/v1/fragments/${postRes.body.fragment.id}`);
  });
});
