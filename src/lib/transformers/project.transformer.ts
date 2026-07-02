import type { HydratedDocument, Types } from 'mongoose'
import type { IProject } from '../../models/Project.model.js'
import type { AssigneeDTO } from './task.transformer.js'

export interface ProjectDTO {
  id: string
  name: string
  description?: string
  identifier: string
  color?: string
  owner: string | AssigneeDTO
  members: (string | AssigneeDTO)[]
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

function toMemberDTO(member: Types.ObjectId | PopulatedUser): string | AssigneeDTO {
  if (isPopulatedUser(member)) {
    return { id: member._id.toString(), name: member.name, email: member.email, avatar: member.avatar }
  }
  return member.toString()
}

export function toProjectDTO(doc: HydratedDocument<IProject>): ProjectDTO {
  const obj = doc.toObject()
  return {
    id: obj._id.toString(),
    name: obj.name,
    description: obj.description,
    identifier: obj.identifier,
    color: obj.color,
    owner: toMemberDTO(obj.owner as unknown as Types.ObjectId | PopulatedUser),
    members: obj.members.map((m) => toMemberDTO(m as unknown as Types.ObjectId | PopulatedUser)),
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  }
}
