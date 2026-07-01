import { Router } from 'express'
import { register, login, me } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { registerSchema, loginSchema } from '../lib/schemas.js'

const router = Router()

router.post('/register', registerLimiter, validate(registerSchema), register)
router.post('/login', loginLimiter, validate(loginSchema), login)
router.get('/me', authenticate, me)

export default router
