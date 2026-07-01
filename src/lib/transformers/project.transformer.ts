import type { HydratedDocument } from 'mongoose'
import type { IProject } from '../../models/Project.model.js'

export interface ProjectDTO {
  id: string
  name: string
  description?: string
  identifier: string
  color?: string
  owner: string
  members: string[]
  createdAt: string
  updatedAt: string
}

export function toProjectDTO(doc: HydratedDocument<IProject>): ProjectDTO {
  const obj = doc.toObject()
  return {
    id: obj._id.toString(),
    name: obj.name,
    description: obj.description,
    identifier: obj.identifier,
    color: obj.color,
    owner: obj.owner.toString(),
    members: obj.members.map((m) => m.toString()),
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  }
}
