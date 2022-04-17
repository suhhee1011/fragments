const request = require('supertest');
const app = require('../../src/app');
const fs = require('fs');

describe('GET /v1/fragments', () => {
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });
  test('Get all fragments list of authenticated user get?expand=1', async () => {
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('Get all fragments list of Unauthenticated user get?expand=1', async () => {
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('whoareyou@email.com', 'password1');
    expect(res.statusCode).toBe(401);
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

  test('Authenticated requests get with wrong id', async () => {
    const res = await request(app).get('/v1/fragments/123').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });

  test('Authenticated requests of post and get/:id.ext from md to html', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# This is markdown');

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id + '.html')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('text/html; charset=utf-8');
  });

  test('Authenticated requests of post and get/:id.ext from md to txt', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# This is markdown');

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id + '.txt')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('text/plain');
  });

  test('Authenticated requests of post and get/:id.ext from md to image', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# This is markdown');

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id + '.png')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(415);
  });

  test('Authenticated requests of post and get/:id.ext from md to txt', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# This is markdown');

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id + '.txt')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('text/plain');
  });

  test('Authenticated requests of post and get/:id.ext from html to txt', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')
      .send('<h1>Hi I am html</h1>');

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id + '.txt')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('text/plain');
  });

  test('Authenticated requests of post and get/:id.ext from html to md', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')
      .send('<h1>Hi I am html</h1>');

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id + '.md')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(415);
  });

  test('Authenticated requests of post and get/:id.ext from json to txt', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send('{firstName:"suhhee", lastName: "Kim" }');

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id + '.txt')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('text/plain');
  });

  test('Authenticated requests of post and get/:id.ext from json to html', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send('{firstName:"suhhee", lastName: "Kim" }');

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id + '.html')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(415);
  });

  test('Authenticated requests of post and get/:id.ext from png to jpeg', async () => {
    const file = fs.readFileSync('tests/unit/test.png');
    const blob = Buffer.from(file);

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png')
      .send(blob);

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id + '.jpg')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('image/jpeg; charset=utf-8');
  });

  test('Authenticated requests of post and get/:id.ext from jpeg to png', async () => {
    const file = fs.readFileSync('tests/unit/test.png');
    const blob = Buffer.from(file);

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/jpeg')
      .send(blob);

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id + '.png')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('image/png; charset=utf-8');
  });

  test('Authenticated requests of post and get/:id.ext from jpeg to png', async () => {
    const file = fs.readFileSync('tests/unit/sample.webp');
    const blob = Buffer.from(file);

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/jpeg')
      .send(blob);

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id + '.gif')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('image/gif; charset=utf-8');
  });

  test('Authenticated requests of post and get/:id.ext from jpeg to webp', async () => {
    const file = fs.readFileSync('tests/unit/test.jpg');
    const blob = Buffer.from(file);

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/jpeg')
      .send(blob);

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id + '.webp')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('image/webp; charset=utf-8');
  });

  test('Authenticated requests of post and get/:id/:info', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# I am markdown>');

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id + '/info')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
  });

  test('Authenticated requests of post and get/:id/:info with wrong Id', async () => {
    const getRes = await request(app)
      .get('/v1/fragments/123456/info')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(404);
  });
});
