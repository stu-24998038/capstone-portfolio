const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret-that-is-long-enough-123456';
process.env.MONGOMS_DOWNLOAD_DIR =
  process.env.MONGOMS_DOWNLOAD_DIR ||
  path.resolve(__dirname, '..', '.mongodb-binaries');

let mongod;
let request;
let app;
let connectDB;
let disconnectDB;

let adminToken;
let readerToken;
let adminId;
let projectId;
let postId;

before(async () => {
  mongod = await MongoMemoryServer.create({ instance: { dbName: 'folio-test' } });
  process.env.MONGODB_URI = mongod.getUri('folio-test');

  ({ connectDB, disconnectDB } = require('../src/config/db'));
  await connectDB();
  app = require('../src/app');
  request = require('supertest');
});

after(async () => {
  if (disconnectDB) await disconnectDB();
  if (mongod) await mongod.stop();
});

test('health endpoint reports a connected database and security headers', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.database, 'connected');
  assert.equal(res.headers['x-content-type-options'], 'nosniff');
  assert.equal(res.headers['x-powered-by'], undefined);
});

test('registration validates weak input', async () => {
  const res = await request(app)
    .post('/api/users/register')
    .send({ username: 'ab', email: 'not-an-email', password: '123' });

  assert.equal(res.status, 422);
  assert.equal(res.body.success, false);
  assert.ok(res.body.errors.length >= 3);
});

test('registers an admin without leaking the password hash', async () => {
  const res = await request(app).post('/api/users/register').send({
    username: 'alex',
    email: 'admin@folio.dev',
    password: 'Admin123!',
  });

  assert.equal(res.status, 201);
  assert.ok(res.body.token);
  assert.equal(res.body.user.username, 'alex');
  assert.equal(res.body.user.password, undefined);
  adminToken = res.body.token;
  adminId = res.body.user._id;
});

test('rejects a duplicate email with a 409', async () => {
  const res = await request(app).post('/api/users/register').send({
    username: 'alex2',
    email: 'admin@folio.dev',
    password: 'Admin123!',
  });
  assert.equal(res.status, 409);
  assert.match(res.body.message, /already exists/i);
});

test('registers a second user for authorization checks', async () => {
  const res = await request(app).post('/api/users/register').send({
    username: 'maya',
    email: 'maya@folio.dev',
    password: 'Reader123!',
  });
  assert.equal(res.status, 201);
  readerToken = res.body.token;
});

test('login rejects a bad password and returns a token for a good one', async () => {
  const bad = await request(app)
    .post('/api/users/login')
    .send({ email: 'admin@folio.dev', password: 'wrong-password' });
  assert.equal(bad.status, 401);

  const good = await request(app)
    .post('/api/users/login')
    .send({ email: 'admin@folio.dev', password: 'Admin123!' });
  assert.equal(good.status, 200);
  assert.ok(good.body.token);

  const me = await request(app)
    .get('/api/users/me')
    .set('Authorization', `Bearer ${good.body.token}`);
  assert.equal(me.status, 200);
  assert.equal(me.body.user.email, 'admin@folio.dev');
});

test('protected routes require a valid Bearer token', async () => {
  const noToken = await request(app).post('/api/projects').send({
    title: 'Unauthorized',
    description: 'This should not be created.',
  });
  assert.equal(noToken.status, 401);

  const badToken = await request(app)
    .get('/api/users/me')
    .set('Authorization', 'Bearer not-a-real-token');
  assert.equal(badToken.status, 401);
});

test('creates, lists, reads, updates, and deletes a project', async () => {
  const created = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Northstar Analytics',
      description: 'A climate analytics workspace for reporting teams.',
      techStack: ['React', 'Node.js'],
      featured: true,
      accent: 'sky',
    });

  assert.equal(created.status, 201);
  assert.equal(created.body.user._id, adminId);
  projectId = created.body._id;

  const list = await request(app).get('/api/projects');
  assert.equal(list.status, 200);
  assert.equal(list.body.length, 1);
  assert.equal(list.body[0].title, 'Northstar Analytics');

  const one = await request(app).get(`/api/projects/${projectId}`);
  assert.equal(one.status, 200);
  assert.equal(one.body._id, projectId);

  const updated = await request(app)
    .put(`/api/projects/${projectId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ title: 'Northstar Analytics v2', featured: false });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.title, 'Northstar Analytics v2');
  assert.equal(updated.body.featured, false);
});

test('a different user cannot edit or delete another user’s project', async () => {
  const edit = await request(app)
    .put(`/api/projects/${projectId}`)
    .set('Authorization', `Bearer ${readerToken}`)
    .send({ title: 'Hijacked' });
  assert.equal(edit.status, 403);

  const remove = await request(app)
    .delete(`/api/projects/${projectId}`)
    .set('Authorization', `Bearer ${readerToken}`);
  assert.equal(remove.status, 403);
});

test('creates a blog post and returns populated authors', async () => {
  const created = await request(app)
    .post('/api/blog')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Designing for the in-between',
      content: 'A post about the pauses and handoffs that make a product feel human.',
      tags: ['Design', 'Process'],
      featured: true,
    });

  assert.equal(created.status, 201);
  assert.equal(created.body.author.username, 'alex');
  assert.equal(created.body.excerpt.length > 0, true);
  postId = created.body._id;

  const list = await request(app).get('/api/blog');
  assert.equal(list.status, 200);
  assert.equal(list.body[0].author.username, 'alex');
});

test('only the post author may update or delete a blog post', async () => {
  const edit = await request(app)
    .put(`/api/blog/${postId}`)
    .set('Authorization', `Bearer ${readerToken}`)
    .send({ title: 'Hijacked post' });
  assert.equal(edit.status, 403);

  const remove = await request(app)
    .delete(`/api/blog/${postId}`)
    .set('Authorization', `Bearer ${readerToken}`);
  assert.equal(remove.status, 403);

  const ownerEdit = await request(app)
    .put(`/api/blog/${postId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ title: 'Designing for the in-between, revised' });
  assert.equal(ownerEdit.status, 200);
});

test('comments can be read publicly and created by signed-in users', async () => {
  const unauthorized = await request(app)
    .post(`/api/blog/${postId}/comments`)
    .send({ body: 'No token here.' });
  assert.equal(unauthorized.status, 401);

  const created = await request(app)
    .post(`/api/blog/${postId}/comments`)
    .set('Authorization', `Bearer ${readerToken}`)
    .send({ body: 'This is a thoughtful piece — thank you for sharing it.' });
  assert.equal(created.status, 201);
  assert.equal(created.body.author.username, 'maya');

  const list = await request(app).get(`/api/blog/${postId}/comments`);
  assert.equal(list.status, 200);
  assert.equal(list.body.length, 1);

  const detail = await request(app).get(`/api/blog/${postId}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.comments.length, 1);
  assert.equal(detail.body.comments[0].author.username, 'maya');
});

test('contact form validates input, stores messages, and exposes an admin inbox', async () => {
  const invalid = await request(app)
    .post('/api/contact')
    .send({ name: 'A', email: 'nope', message: 'short' });
  assert.equal(invalid.status, 422);

  const created = await request(app).post('/api/contact').send({
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    message: 'I would love to talk about a project for this autumn.',
  });
  assert.equal(created.status, 201);

  const unauthorized = await request(app).get('/api/contact');
  assert.equal(unauthorized.status, 401);

  const inbox = await request(app)
    .get('/api/contact')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(inbox.status, 200);
  assert.equal(inbox.body.length, 1);

  const messageId = inbox.body[0]._id;
  const marked = await request(app)
    .patch(`/api/contact/${messageId}/read`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ read: true });
  assert.equal(marked.status, 200);
  assert.equal(marked.body.read, true);

  const removed = await request(app)
    .delete(`/api/contact/${messageId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(removed.status, 200);
});

test('deleting a post also deletes its comments', async () => {
  const removed = await request(app)
    .delete(`/api/blog/${postId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(removed.status, 200);

  const missing = await request(app).get(`/api/blog/${postId}`);
  assert.equal(missing.status, 404);

  const comments = await request(app).get(`/api/blog/${postId}/comments`);
  assert.equal(comments.status, 404);
});

test('returns consistent JSON for unknown routes and malformed ids', async () => {
  const unknown = await request(app).get('/api/does-not-exist');
  assert.equal(unknown.status, 404);
  assert.equal(unknown.body.success, false);

  const malformed = await request(app).get('/api/projects/not-an-object-id');
  assert.equal(malformed.status, 400);
  assert.equal(malformed.body.success, false);
});

test('deletes a project for its owner', async () => {
  const removed = await request(app)
    .delete(`/api/projects/${projectId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(removed.status, 200);

  const missing = await request(app).get(`/api/projects/${projectId}`);
  assert.equal(missing.status, 404);
});
