import { Router } from 'express'
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/task.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { createTaskSchema, updateTaskSchema, updateStatusSchema } from '../lib/schemas.js'

const router = Router()

router.use(authenticate)

router.get('/', getTasks)
router.post('/', validate(createTaskSchema), createTask)
router.get('/:id', getTask)
router.patch('/:id', validate(updateTaskSchema), updateTask)
router.patch('/:id/status', validate(updateStatusSchema), updateTaskStatus)
router.delete('/:id', deleteTask)

export default router
