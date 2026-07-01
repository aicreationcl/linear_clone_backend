import type { HydratedDocument } from 'mongoose'
import type { IUser } from '../../models/User.model.js'

export interface UserDTO {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
}

export function toUserDTO(doc: HydratedDocument<IUser>): UserDTO {
  const obj = doc.toObject()
  return {
    id: obj._id.toString(),
    email: obj.email,
    name: obj.name,
    avatar: obj.avatar,
    createdAt: obj.createdAt.toISOString(),
  }
}
