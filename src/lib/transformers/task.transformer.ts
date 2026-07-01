import type { HydratedDocument } from 'mongoose'
import type { ITask } from '../../models/Task.model.js'
import type { UserDTO } from './user.transformer.js'

export interface TaskDTO {
  id: string
  title: string
  description?: string
  status: ITask['status']
  priority: ITask['priority']
  project: string
  assignee?: string | UserDTO
  reporter: string
  dueDate?: string
  order: number
  createdAt: string
  updatedAt: string
}

export function toTaskDTO(doc: HydratedDocument<ITask>): TaskDTO {
  const obj = doc.toObject()
  return {
    id: obj._id.toString(),
    title: obj.title,
    description: obj.description,
    status: obj.status,
    priority: obj.priority,
    project: obj.project.toString(),
    assignee: obj.assignee?.toString(),
    reporter: obj.reporter.toString(),
    dueDate: obj.dueDate?.toISOString(),
    order: obj.order,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  }
}
