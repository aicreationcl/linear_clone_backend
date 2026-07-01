import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDB(): Promise<void> {
  const uri = env.MONGODB_URI
  await mongoose.connect(uri)
  console.log(`MongoDB connected: ${mongoose.connection.host}`)
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect()
}
