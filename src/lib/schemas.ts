import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  identifier: z.string().min(1).max(5, 'Identifier must be 1–5 characters'),
  description: z.string().optional(),
  color: z.string().optional(),
})

export const updateProjectSchema = createProjectSchema.partial()

const taskStatus = z.enum(['backlog', 'todo', 'doing', 'done'])
const taskPriority = z.enum(['none', 'low', 'medium', 'high', 'urgent'])

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  description: z.string().optional(),
  status: taskStatus.optional(),
  priority: taskPriority.optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
})

export const updateTaskSchema = createTaskSchema.omit({ projectId: true }).partial()

export const updateStatusSchema = z.object({
  status: taskStatus,
  order: z.number().optional(),
})
