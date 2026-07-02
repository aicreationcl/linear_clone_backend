import type { HydratedDocument, Types } from 'mongoose'
import type { ITask } from '../../models/Task.model.js'

export interface AssigneeDTO {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface TaskDTO {
  id: string
  title: string
  description?: string
  status: ITask['status']
  priority: ITask['priority']
  project: string
  assignee?: string | AssigneeDTO
  reporter: string
  dueDate?: string
  order: number
  createdAt: string
  updatedAt: string
}

interface PopulatedUser {
  _id: Types.ObjectId
  name: string
  email: string
  avatar?: string
}

function isPopulatedUser(value: unknown): value is PopulatedUser {
  return typeof value === 'object' && value !== null && 'email' in value
}

function toAssigneeDTO(assignee: Types.ObjectId | PopulatedUser | undefined): string | AssigneeDTO | undefined {
  if (!assignee) return undefined
  if (isPopulatedUser(assignee)) {
    return {
      id: assignee._id.toString(),
      name: assignee.name,
      email: assignee.email,
      avatar: assignee.avatar,
    }
  }
  return assignee.toString()
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
    assignee: toAssigneeDTO(obj.assignee as unknown as Types.ObjectId | PopulatedUser | undefined),
    reporter: obj.reporter.toString(),
    dueDate: obj.dueDate?.toISOString(),
    order: obj.order,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  }
}
