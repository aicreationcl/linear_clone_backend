import { Router } from 'express'
import {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { createProjectSchema, updateProjectSchema } from '../lib/schemas.js'

const router = Router()

router.use(authenticate)

router.get('/', getProjects)
router.post('/', validate(createProjectSchema), createProject)
router.get('/:id', getProject)
router.patch('/:id', validate(updateProjectSchema), updateProject)
router.delete('/:id', deleteProject)

export default router
