import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'

let token: string
let userId: string

beforeEach(async () => {
  const reg = await request(app).post('/api/auth/register').send({
    email: 'projects@example.com',
    password: 'password123',
    name: 'Projects User',
  })
  token = reg.body.token
  userId = reg.body.user.id
})

describe('GET /api/projects/:id', () => {
  it('returns the project with owner and members populated', async () => {
    const created = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Solo Project', identifier: 'SP' })

    const res = await request(app)
      .get(`/api/projects/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.owner).toMatchObject({ id: userId, name: 'Projects User' })
    expect(res.body.data.members[0]).toMatchObject({ id: userId, name: 'Projects User' })
  })

  it('returns 404 for a project the user cannot access', async () => {
    const created = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Private Project', identifier: 'PP' })

    const other = await request(app).post('/api/auth/register').send({
      email: 'notmember@example.com',
      password: 'password123',
      name: 'Not Member',
    })

    const res = await request(app)
      .get(`/api/projects/${created.body.data.id}`)
      .set('Authorization', `Bearer ${other.body.token}`)
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/projects/:id', () => {
  it('updates name and color for the owner', async () => {
    const created = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Old Name', identifier: 'ON' })

    const res = await request(app)
      .patch(`/api/projects/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Name', color: '#ff0000' })

    expect(res.status).toBe(200)
    expect(res.body.data.name).toBe('New Name')
    expect(res.body.data.color).toBe('#ff0000')
  })
})

describe('DELETE /api/projects/:id', () => {
  it('deletes the project and cascades to its tasks', async () => {
    const created = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'To Delete', identifier: 'TD' })
    const projectId = created.body.data.id

    const task = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Orphan task', projectId })

    const del = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(del.status).toBe(200)

    const getTask = await request(app)
      .get(`/api/tasks/${task.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(getTask.status).toBe(404)
  })
})
