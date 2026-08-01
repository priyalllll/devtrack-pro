// server/src/services/comment.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Task comments business logic.
// ─────────────────────────────────────────────────────────────────────────────

import prisma from '../lib/prisma.js'
import { AppError } from '../middleware/errorHandler.middleware.js'
import { HTTP } from '../config/constants.js'

// Verify user can access task's project
async function assertTaskAccess(taskId, userId) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true, title: true },
  })

  if (!task) {
    throw new AppError('Task not found.', HTTP.NOT_FOUND, 'TASK_NOT_FOUND')
  }

  const project = await prisma.project.findFirst({
    where: {
      id: task.projectId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
    select: { id: true },
  })

  if (!project) {
    throw new AppError('Access denied.', HTTP.FORBIDDEN, 'TASK_ACCESS_DENIED')
  }

  return task
}

// ── List Comments ──────────────────────────────────────────────────────────────
export async function listComments(taskId, userId) {
  await assertTaskAccess(taskId, userId)

  const comments = await prisma.comment.findMany({
    where: { taskId },
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  })

  return comments
}

// ── Create Comment ─────────────────────────────────────────────────────────────
export async function createComment(taskId, userId, content) {
  const task = await assertTaskAccess(taskId, userId)

  if (!content || !content.trim()) {
    throw new AppError('Comment content cannot be empty.', HTTP.BAD_REQUEST, 'EMPTY_COMMENT')
  }

  const comment = await prisma.comment.create({
    data: {
      taskId,
      authorId: userId,
      content: content.trim(),
    },
    include: {
      author: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  })

  // Create ActivityLog entry
  try {
    await prisma.activityLog.create({
      data: {
        projectId: task.projectId,
        taskId: task.id,
        actorId: userId,
        action: 'comment.added',
        meta: { commentId: comment.id, taskTitle: task.title },
      },
    })
  } catch (err) {
    console.error('Failed to log comment.added activity:', err)
  }

  return comment
}

// ── Delete Comment ─────────────────────────────────────────────────────────────
export async function deleteComment(taskId, commentId, userId) {
  await assertTaskAccess(taskId, userId)

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, authorId: true, taskId: true },
  })

  if (!comment || comment.taskId !== taskId) {
    throw new AppError('Comment not found.', HTTP.NOT_FOUND, 'COMMENT_NOT_FOUND')
  }

  // Only author or project ADMIN/OWNER can delete comment
  if (comment.authorId !== userId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    })

    const project = await prisma.project.findFirst({
      where: {
        id: task.projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId, role: { in: ['OWNER', 'ADMIN'] } } } },
        ],
      },
      select: { id: true },
    })

    if (!project) {
      throw new AppError('You can only delete your own comments.', HTTP.FORBIDDEN, 'COMMENT_DELETE_DENIED')
    }
  }

  await prisma.comment.delete({ where: { id: commentId } })
}
