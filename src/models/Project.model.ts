import { Schema, model, type Types } from 'mongoose'

export interface IProject {
  name: string
  description?: string
  identifier: string
  color?: string
  owner: Types.ObjectId
  members: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    identifier: { type: String, required: true, unique: true, uppercase: true, trim: true },
    color: { type: String, default: '#5e6ad2' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

ProjectSchema.index({ owner: 1 })

export const Project = model<IProject>('Project', ProjectSchema)
