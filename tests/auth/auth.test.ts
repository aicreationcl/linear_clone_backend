import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'

describe('POST /api/auth/register', () => {
  it('creates a user and returns token + user DTO', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('token')
    expect(res.body.user).toMatchObject({
      email: 'test@example.com',
      name: 'Test User',
    })
    expect(res.body.user).not.toHaveProperty('password')
  })

  it('returns 409 if email already in use', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'dup@example.com',
      password: 'password123',
      name: 'Dup User',
    })
    const res = await request(app).post('/api/auth/register').send({
      email: 'dup@example.com',
      password: 'other123',
      name: 'Other',
    })
    expect(res.status).toBe(409)
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com' })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('returns token + user on valid credentials', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'login@example.com',
      password: 'password123',
      name: 'Login User',
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body.user.email).toBe('login@example.com')
  })

  it('returns 401 on wrong password', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'wrong@example.com',
      password: 'correctpass',
      name: 'User',
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrongpass' })

    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/me', () => {
  it('returns authenticated user', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      email: 'me@example.com',
      password: 'password123',
      name: 'Me User',
    })

    const { token } = registerRes.body as { token: string }

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('me@example.com')
    expect(res.body.user).not.toHaveProperty('password')
  })

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })
})

describe('GET /api/projects (select fields test — LA-2026-001)', () => {
  it('returns only projected fields in project list', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      email: 'proj@example.com',
      password: 'password123',
      name: 'Proj User',
    })
    const { token } = reg.body as { token: string }

    await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My Project', identifier: 'MP' })

    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    const project = res.body.data[0]
    expect(project).toHaveProperty('name')
    expect(project).toHaveProperty('identifier')
    expect(project).toHaveProperty('color')
    expect(project).toHaveProperty('id')
    expect(project).not.toHaveProperty('__v')
  })
})
