import type { IUser } from '../models/User.model.js'
import type { HydratedDocument } from 'mongoose'

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<IUser>
    }
  }
}
