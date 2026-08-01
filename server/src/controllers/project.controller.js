// server/src/controllers/project.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// HTTP handlers for Project endpoints.
// All routes are already protected by authenticate middleware in the router.
// ─────────────────────────────────────────────────────────────────────────────

import { HTTP } from '../config/constants.js'
import { AppError } from '../middleware/errorHandler.middleware.js'
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
} from '../validators/project.validators.js'
import * as projectService from '../services/project.service.js'

// ── GET /projects ──────────────────────────────────────────────────────────────
export async function listProjects(req, res, next) {
  try {
    const parse = projectQuerySchema.safeParse(req.query)
    if (!parse.success) {
      return res.status(HTTP.UNPROCESSABLE).json({
        success: false,
        message: 'Invalid query parameters.',
        errors:  parse.error.issues,
      })
    }

    const userId = req.user?.id || req.user?.userId
    if (!userId) {
      throw new AppError('Authentication required. User ID missing.', HTTP.UNAUTHORIZED, 'UNAUTHORIZED')
    }

    const result = await projectService.listProjects(userId, parse.data)

    return res.status(HTTP.OK).json({
      success: true,
      data:    result,
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /projects ─────────────────────────────────────────────────────────────
export async function createProject(req, res, next) {
  try {
    const parse = createProjectSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(HTTP.UNPROCESSABLE).json({
        success: false,
        message: 'Validation failed.',
        errors:  parse.error.issues,
      })
    }

    const userId = req.user?.id || req.user?.userId
    if (!userId) {
      throw new AppError('Authentication required. User ID missing.', HTTP.UNAUTHORIZED, 'UNAUTHORIZED')
    }

    const project = await projectService.createProject(userId, parse.data)

    return res.status(HTTP.CREATED).json({
      success: true,
      message: 'Project created.',
      data:    { project },
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /projects/:id ──────────────────────────────────────────────────────────
export async function getProject(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.userId
    if (!userId) {
      throw new AppError('Authentication required. User ID missing.', HTTP.UNAUTHORIZED, 'UNAUTHORIZED')
    }

    const project = await projectService.getProject(req.params.id, userId)

    return res.status(HTTP.OK).json({
      success: true,
      data:    { project },
    })
  } catch (err) {
    next(err)
  }
}

// ── PUT /projects/:id ──────────────────────────────────────────────────────────
export async function updateProject(req, res, next) {
  try {
    const parse = updateProjectSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(HTTP.UNPROCESSABLE).json({
        success: false,
        message: 'Validation failed.',
        errors:  parse.error.issues,
      })
    }

    const userId = req.user?.id || req.user?.userId
    if (!userId) {
      throw new AppError('Authentication required. User ID missing.', HTTP.UNAUTHORIZED, 'UNAUTHORIZED')
    }

    const project = await projectService.updateProject(
      req.params.id,
      userId,
      parse.data,
    )

    return res.status(HTTP.OK).json({
      success: true,
      message: 'Project updated.',
      data:    { project },
    })
  } catch (err) {
    next(err)
  }
}

// ── DELETE /projects/:id ───────────────────────────────────────────────────────
export async function deleteProject(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.userId
    if (!userId) {
      throw new AppError('Authentication required. User ID missing.', HTTP.UNAUTHORIZED, 'UNAUTHORIZED')
    }

    await projectService.deleteProject(req.params.id, userId)

    return res.status(HTTP.NO_CONTENT).send()
  } catch (err) {
    next(err)
  }
}
