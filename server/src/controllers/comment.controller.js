// server/src/controllers/comment.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Comment HTTP handlers.
// ─────────────────────────────────────────────────────────────────────────────

import { HTTP } from '../config/constants.js'
import { AppError } from '../middleware/errorHandler.middleware.js'
import * as commentService from '../services/comment.service.js'

function getUserId(req) {
  const id = req.user?.id || req.user?.userId
  if (!id) throw new AppError('Authentication required.', HTTP.UNAUTHORIZED, 'UNAUTHORIZED')
  return id
}

// ── GET /tasks/:taskId/comments ───────────────────────────────────────────────
export async function listComments(req, res, next) {
  try {
    const comments = await commentService.listComments(req.params.taskId, getUserId(req))
    return res.status(HTTP.OK).json({ success: true, data: { comments } })
  } catch (err) {
    next(err)
  }
}

// ── POST /tasks/:taskId/comments ──────────────────────────────────────────────
export async function createComment(req, res, next) {
  try {
    const { content } = req.body
    const comment = await commentService.createComment(req.params.taskId, getUserId(req), content)
    return res.status(HTTP.CREATED).json({
      success: true,
      message: 'Comment added.',
      data: { comment },
    })
  } catch (err) {
    next(err)
  }
}

// ── DELETE /tasks/:taskId/comments/:commentId ─────────────────────────────────
export async function deleteComment(req, res, next) {
  try {
    await commentService.deleteComment(req.params.taskId, req.params.commentId, getUserId(req))
    return res.status(HTTP.NO_CONTENT).send()
  } catch (err) {
    next(err)
  }
}
