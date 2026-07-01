import app from './app.js'
import { connectDB } from './config/db.js'
import { env } from './config/env.js'

async function main(): Promise<void> {
  await connectDB()
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`)
  })
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
