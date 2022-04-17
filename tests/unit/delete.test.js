const request = require('supertest');

const app = require('../../src/app');

test('Authenticated requests of post and delete/:id', async () => {
  const postRes = await request(app)
    .post('/v1/fragments')
    .auth('user1@email.com', 'password1')
    .set('Content-Type', 'text/plain')
    .send('Hi, This is test');

  const deleteFrag = await request(app)
    .delete('/v1/fragments/' + postRes.body.fragment.id)
    .auth('user1@email.com', 'password1');
  expect(deleteFrag.statusCode).toBe(200);
});

test('Authenticated requests of delete With Wrong ID', async () => {
  const deleteFrag = await request(app)
    .delete('/v1/fragments/suhheeKim')
    .auth('user1@email.com', 'password1');
  expect(deleteFrag.statusCode).toBe(404);
});

test('UnAuthenticated requests of delete', async () => {
  const deleteFrag = await request(app)
    .delete('/v1/fragments/suhheeKim')
    .auth('whoareyou@email.com', 'password1');
  expect(deleteFrag.statusCode).toBe(401);
});
