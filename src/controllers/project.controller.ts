import type { Request, Response } from 'express'
import { Project } from '../models/Project.model.js'
import { Task } from '../models/Task.model.js'
import { toProjectDTO } from '../lib/transformers/project.transformer.js'

export async function getProjects(req: Request, res: Response): Promise<void> {
  const userId = req.user!._id
  const projects = await Project.find({
    $or: [{ owner: userId }, { members: userId }],
  }).select('name identifier color description owner members createdAt updatedAt')

  res.json({ data: projects.map(toProjectDTO) })
}

export async function createProject(req: Request, res: Response): Promise<void> {
  const { name, description, identifier, color } = req.body as {
    name: string
    description?: string
    identifier: string
    color?: string
  }

  if (!name || !identifier) {
    res.status(400).json({ error: 'name and identifier are required' })
    return
  }

  const project = await Project.create({
    name,
    description,
    identifier: identifier.toUpperCase(),
    color,
    owner: req.user!._id,
    members: [req.user!._id],
  })

  res.status(201).json({ data: toProjectDTO(project) })
}

export async function getProject(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  const userId = req.user!._id

  const project = await Project.findOne({
    _id: id,
    $or: [{ owner: userId }, { members: userId }],
  })
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar')

  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }

  res.json({ data: toProjectDTO(project) })
}

export async function updateProject(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  const userId = req.user!._id

  const project = await Project.findOne({ _id: id, owner: userId })
  if (!project) {
    res.status(404).json({ error: 'Project not found or you are not the owner' })
    return
  }

  const { name, description, color } = req.body as {
    name?: string
    description?: string
    color?: string
  }

  if (name !== undefined) project.name = name
  if (description !== undefined) project.description = description
  if (color !== undefined) project.color = color

  await project.save()
  res.json({ data: toProjectDTO(project) })
}

export async function deleteProject(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  const userId = req.user!._id

  const project = await Project.findOne({ _id: id, owner: userId })
  if (!project) {
    res.status(404).json({ error: 'Project not found or you are not the owner' })
    return
  }

  await Task.deleteMany({ project: id })
  await project.deleteOne()

  res.json({ message: 'Project deleted' })
}
