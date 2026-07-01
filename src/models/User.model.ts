import { Schema, model } from 'mongoose'

export interface IUser {
  email: string
  password: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    name: { type: String, required: true, trim: true },
    avatar: { type: String },
  },
  { timestamps: true }
)

export const User = model<IUser>('User', UserSchema)
