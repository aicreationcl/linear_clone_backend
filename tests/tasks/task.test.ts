import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'

let token: string
let userId: string
let projectId: string

beforeEach(async () => {
  const reg = await request(app).post('/api/auth/register').send({
    email: 'tasks@example.com',
    password: 'password123',
    name: 'Tasks User',
  })
  token = reg.body.token
  userId = reg.body.user.id

  const project = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Task Project', identifier: 'TP' })
  projectId = project.body.data.id
})

describe('POST /api/tasks', () => {
  it('creates a task with defaults', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My task', projectId })

    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({
      title: 'My task',
      status: 'backlog',
      priority: 'none',
      project: projectId,
    })
  })

  it('returns 403 when the project does not belong to the user', async () => {
    const other = await request(app).post('/api/auth/register').send({
      email: 'other@example.com',
      password: 'password123',
      name: 'Other User',
    })

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${other.body.token}`)
      .send({ title: 'Sneaky task', projectId })

    expect(res.status).toBe(403)
  })
})

describe('GET /api/tasks', () => {
  it('lists tasks for a project with populated assignee', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Assigned task', projectId, assigneeId: userId })

    const res = await request(app)
      .get(`/api/tasks?projectId=${projectId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    const task = res.body.data.find((t: { id: string }) => t.id === created.body.data.id)
    expect(task.assignee).toMatchObject({ id: userId, name: 'Tasks User' })
  })
})

describe('PATCH /api/tasks/:id', () => {
  it('updates only the status on a task with no dueDate or assignee (regression: was rejected with 400)', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Plain task', projectId })

    const res = await request(app)
      .patch(`/api/tasks/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Plain task',
        description: '',
        status: 'doing',
        priority: 'none',
        assigneeId: null,
        dueDate: null,
      })

    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('doing')
  })

  it('sets and then clears assignee and dueDate via null', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'To assign', projectId, assigneeId: userId, dueDate: '2026-08-15' })

    expect(created.body.data.assignee).toBe(userId)
    expect(created.body.data.dueDate).toContain('2026-08-15')

    const cleared = await request(app)
      .patch(`/api/tasks/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ assigneeId: null, dueDate: null })

    expect(cleared.status).toBe(200)
    expect(cleared.body.data.assignee).toBeUndefined()
    expect(cleared.body.data.dueDate).toBeUndefined()
  })
})

describe('PATCH /api/tasks/:id/status', () => {
  it('updates status and order for drag-and-drop', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Drag task', projectId })

    const res = await request(app)
      .patch(`/api/tasks/${created.body.data.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'done', order: 2 })

    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('done')
    expect(res.body.data.order).toBe(2)
  })
})

describe('DELETE /api/tasks/:id', () => {
  it('deletes a task', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'To delete', projectId })

    const del = await request(app)
      .delete(`/api/tasks/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(del.status).toBe(200)

    const get = await request(app)
      .get(`/api/tasks/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(get.status).toBe(404)
  })
})
