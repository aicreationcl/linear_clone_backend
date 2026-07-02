import type { Request, Response } from 'express'
import { Task } from '../models/Task.model.js'
import { Project } from '../models/Project.model.js'
import { toTaskDTO } from '../lib/transformers/task.transformer.js'
import type { TaskStatus, TaskPriority } from '../models/Task.model.js'

async function userHasAccessToProject(userId: string, projectId: string): Promise<boolean> {
  const project = await Project.findOne({
    _id: projectId,
    $or: [{ owner: userId }, { members: userId }],
  }).select('_id')
  return project !== null
}

export async function getTasks(req: Request, res: Response): Promise<void> {
  const { projectId, status, priority, assigneeId } = req.query as Record<
    string,
    string | undefined
  >

  if (!projectId) {
    res.status(400).json({ error: 'projectId is required' })
    return
  }

  const userId = req.user!._id.toString()
  const hasAccess = await userHasAccessToProject(userId, projectId)
  if (!hasAccess) {
    res.status(403).json({ error: 'Access denied to this project' })
    return
  }

  const filter: Record<string, unknown> = { project: projectId }
  if (status) filter['status'] = status
  if (priority) filter['priority'] = priority
  if (assigneeId) filter['assignee'] = assigneeId

  const tasks = await Task.find(filter)
    .select('title status priority assignee reporter dueDate order project createdAt updatedAt')
    .populate('assignee', 'name email avatar')
    .sort({ order: 1 })

  res.json({ data: tasks.map(toTaskDTO) })
}

export async function createTask(req: Request, res: Response): Promise<void> {
  const { title, description, status, priority, projectId, assigneeId, dueDate } = req.body as {
    title: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    projectId: string
    assigneeId?: string | null
    dueDate?: string | null
  }

  if (!title || !projectId) {
    res.status(400).json({ error: 'title and projectId are required' })
    return
  }

  const userId = req.user!._id.toString()
  const hasAccess = await userHasAccessToProject(userId, projectId)
  if (!hasAccess) {
    res.status(403).json({ error: 'Access denied to this project' })
    return
  }

  const lastTask = await Task.findOne({ project: projectId }).sort({ order: -1 }).select('order')
  const order = lastTask ? lastTask.order + 1 : 0

  const task = await Task.create({
    title,
    description,
    status: status ?? 'backlog',
    priority: priority ?? 'none',
    project: projectId,
    assignee: assigneeId ?? undefined,
    reporter: userId,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    order,
  })

  res.status(201).json({ data: toTaskDTO(task) })
}

export async function getTask(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  const userId = req.user!._id.toString()

  const task = await Task.findById(id)
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email')
  if (!task) {
    res.status(404).json({ error: 'Task not found' })
    return
  }

  const hasAccess = await userHasAccessToProject(userId, task.project.toString())
  if (!hasAccess) {
    res.status(403).json({ error: 'Access denied' })
    return
  }

  res.json({ data: toTaskDTO(task) })
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  const userId = req.user!._id.toString()

  const task = await Task.findById(id)
  if (!task) {
    res.status(404).json({ error: 'Task not found' })
    return
  }

  const hasAccess = await userHasAccessToProject(userId, task.project.toString())
  if (!hasAccess) {
    res.status(403).json({ error: 'Access denied' })
    return
  }

  const { title, description, status, priority, assigneeId, dueDate } = req.body as {
    title?: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    assigneeId?: string | null
    dueDate?: string | null
  }

  if (title !== undefined) task.title = title
  if (description !== undefined) task.description = description
  if (status !== undefined) task.status = status
  if (priority !== undefined) task.priority = priority
  if (assigneeId !== undefined) {
    task.assignee = (assigneeId ?? undefined) as unknown as typeof task.assignee
  }
  if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined

  await task.save()
  res.json({ data: toTaskDTO(task) })
}

export async function updateTaskStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  const { status, order } = req.body as { status: TaskStatus; order?: number }
  const userId = req.user!._id.toString()

  const task = await Task.findById(id)
  if (!task) {
    res.status(404).json({ error: 'Task not found' })
    return
  }

  const hasAccess = await userHasAccessToProject(userId, task.project.toString())
  if (!hasAccess) {
    res.status(403).json({ error: 'Access denied' })
    return
  }

  task.status = status
  if (order !== undefined) task.order = order
  await task.save()

  res.json({ data: toTaskDTO(task) })
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  const userId = req.user!._id.toString()

  const task = await Task.findById(id)
  if (!task) {
    res.status(404).json({ error: 'Task not found' })
    return
  }

  const hasAccess = await userHasAccessToProject(userId, task.project.toString())
  if (!hasAccess) {
    res.status(403).json({ error: 'Access denied' })
    return
  }

  await task.deleteOne()
  res.json({ message: 'Task deleted' })
}
