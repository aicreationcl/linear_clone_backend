import { Schema, model, type Types } from 'mongoose'

export type TaskStatus = 'backlog' | 'todo' | 'doing' | 'done'
export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent'

export interface ITask {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  project: Types.ObjectId
  assignee?: Types.ObjectId
  reporter: Types.ObjectId
  dueDate?: Date
  order: number
  createdAt: Date
  updatedAt: Date
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'doing', 'done'] satisfies TaskStatus[],
      default: 'backlog',
    },
    priority: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'urgent'] satisfies TaskPriority[],
      default: 'none',
    },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

TaskSchema.index({ project: 1, status: 1 })
TaskSchema.index({ project: 1, order: 1 })
TaskSchema.index({ assignee: 1 })

export const Task = model<ITask>('Task', TaskSchema)
