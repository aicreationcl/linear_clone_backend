import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import authRoutes from './routes/auth.routes.js'
import projectRoutes from './routes/project.routes.js'
import taskRoutes from './routes/task.routes.js'
import { errorHandler, notFound } from './middleware/error.middleware.js'

const app = express()

const allowedOrigins = env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim())

/**
 * CORS: only allow origins listed in CORS_ALLOWED_ORIGINS env var.
 * Never use origin: '*' in production — it bypasses cookie and auth header restrictions.
 */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`))
      }
    },
    credentials: true,
  })
)

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
