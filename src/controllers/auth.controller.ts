import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.model.js'
import { env } from '../config/env.js'
import { toUserDTO } from '../lib/transformers/user.transformer.js'

function signToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, name } = req.body as { email: string; password: string; name: string }

  if (!email || !password || !name) {
    res.status(400).json({ error: 'email, password, and name are required' })
    return
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    res.status(409).json({ error: 'Email already in use' })
    return
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await User.create({ email, password: hashed, name })
  const token = signToken(user._id.toString())

  res.status(201).json({ token, user: toUserDTO(user) })
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string }

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' })
    return
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const token = signToken(user._id.toString())
  res.json({ token, user: toUserDTO(user) })
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  res.json({ user: toUserDTO(req.user) })
}
