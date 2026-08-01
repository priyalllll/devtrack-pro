// server/src/controllers/task.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// HTTP handlers for Task endpoints.
// ─────────────────────────────────────────────────────────────────────────────

import { HTTP } from '../config/constants.js'
import { AppError } from '../middleware/errorHandler.middleware.js'
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from '../validators/task.validators.js'
import * as taskService from '../services/task.service.js'

// Helper: extract userId from req
function getUserId(req) {
  const id = req.user?.id || req.user?.userId
  if (!id) throw new AppError('Authentication required.', HTTP.UNAUTHORIZED, 'UNAUTHORIZED')
  return id
}

// ── GET /tasks ─────────────────────────────────────────────────────────────────
export async function listTasks(req, res, next) {
  try {
    const parse = taskQuerySchema.safeParse(req.query)
    if (!parse.success) {
      return res.status(HTTP.UNPROCESSABLE).json({
        success: false,
        message: 'Invalid query parameters.',
        errors:  parse.error.issues,
      })
    }
    const result = await taskService.listTasks(getUserId(req), parse.data)
    return res.status(HTTP.OK).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// ── GET /tasks/:id ─────────────────────────────────────────────────────────────
export async function getTask(req, res, next) {
  try {
    const task = await taskService.getTask(req.params.id, getUserId(req))
    return res.status(HTTP.OK).json({ success: true, data: { task } })
  } catch (err) {
    next(err)
  }
}

// ── POST /tasks ────────────────────────────────────────────────────────────────
export async function createTask(req, res, next) {
  try {
    const parse = createTaskSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(HTTP.UNPROCESSABLE).json({
        success: false,
        message: 'Validation failed.',
        errors:  parse.error.issues,
      })
    }
    const task = await taskService.createTask(getUserId(req), parse.data)
    return res.status(HTTP.CREATED).json({
      success: true,
      message: 'Task created.',
      data:    { task },
    })
  } catch (err) {
    next(err)
  }
}

// ── PUT /tasks/:id ─────────────────────────────────────────────────────────────
export async function updateTask(req, res, next) {
  try {
    const parse = updateTaskSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(HTTP.UNPROCESSABLE).json({
        success: false,
        message: 'Validation failed.',
        errors:  parse.error.issues,
      })
    }
    const task = await taskService.updateTask(req.params.id, getUserId(req), parse.data)
    return res.status(HTTP.OK).json({
      success: true,
      message: 'Task updated.',
      data:    { task },
    })
  } catch (err) {
    next(err)
  }
}

// ── DELETE /tasks/:id ──────────────────────────────────────────────────────────
export async function deleteTask(req, res, next) {
  try {
    await taskService.deleteTask(req.params.id, getUserId(req))
    return res.status(HTTP.NO_CONTENT).send()
  } catch (err) {
    next(err)
  }
}
