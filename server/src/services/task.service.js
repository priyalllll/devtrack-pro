// server/src/services/task.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Task business logic.
//
// Authorization:
//   - Read tasks: user must be project member OR project owner.
//   - Create tasks: same access + task creator is set automatically.
//   - Update tasks: creator, assignee, or OWNER/ADMIN of project.
//   - Delete tasks: creator or project OWNER/ADMIN.
// ─────────────────────────────────────────────────────────────────────────────

import prisma    from '../lib/prisma.js'
import { AppError } from '../middleware/errorHandler.middleware.js'
import { HTTP } from '../config/constants.js'

// ── Shared include for task queries ───────────────────────────────────────────
const TASK_INCLUDE = {
  project:   { select: { id: true, name: true, color: true } },
  createdBy: { select: { id: true, name: true, avatarUrl: true } },
  assignee:  { select: { id: true, name: true, avatarUrl: true } },
  column:    { select: { id: true, name: true, color: true } },
  _count:    { select: { comments: true, labels: true } },
}

// ── Verify user can access a project (owner or member) ────────────────────────
async function assertProjectAccess(projectId, userId) {
  const membership = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
    select: { id: true, ownerId: true },
  })
  if (!membership) {
    throw new AppError('Project not found or access denied.', HTTP.FORBIDDEN, 'PROJECT_ACCESS_DENIED')
  }
  return membership
}

// ── Verify user can write to a task (creator, assignee, or ADMIN/OWNER) ────────
async function assertTaskWriteAccess(taskId, userId) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, createdById: true, assigneeId: true, projectId: true },
  })
  if (!task) {
    throw new AppError('Task not found.', HTTP.NOT_FOUND, 'TASK_NOT_FOUND')
  }

  // Creator or assignee can always edit
  if (task.createdById === userId || task.assigneeId === userId) return task

  // Project OWNER or ADMIN can edit
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
    throw new AppError('You do not have permission to modify this task.', HTTP.FORBIDDEN, 'TASK_ACCESS_DENIED')
  }
  return task
}

// ── Verify user can delete a task (creator or project OWNER/ADMIN) ─────────────
async function assertTaskDeleteAccess(taskId, userId) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, createdById: true, projectId: true },
  })
  if (!task) {
    throw new AppError('Task not found.', HTTP.NOT_FOUND, 'TASK_NOT_FOUND')
  }

  if (task.createdById === userId) return task

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
    throw new AppError('You do not have permission to delete this task.', HTTP.FORBIDDEN, 'TASK_DELETE_DENIED')
  }
  return task
}

// ── Create ────────────────────────────────────────────────────────────────────
export async function createTask(userId, data) {
  if (!userId) {
    throw new AppError('Authentication required.', HTTP.UNAUTHORIZED, 'UNAUTHORIZED')
  }

  // Verify user has project access
  await assertProjectAccess(data.projectId, userId)

  // Get the max position in the project/column so we append at the end
  const maxPositionRow = await prisma.task.aggregate({
    where: {
      projectId: data.projectId,
      columnId:  data.columnId ?? null,
      isArchived: false,
    },
    _max: { position: true },
  })
  const nextPosition = (maxPositionRow._max.position ?? 0) + 1000

  return prisma.task.create({
    data: {
      title:       data.title,
      description: data.description ?? null,
      projectId:   data.projectId,
      columnId:    data.columnId    ?? null,
      createdById: userId,
      assigneeId:  data.assigneeId  ?? null,
      status:      data.status      ?? 'TODO',
      priority:    data.priority    ?? 'NONE',
      dueDate:     data.dueDate     ? new Date(data.dueDate) : null,
      position:    nextPosition,
    },
    include: TASK_INCLUDE,
  })
}

// ── List ──────────────────────────────────────────────────────────────────────
export async function listTasks(userId, query) {
  const {
    projectId, status, priority, assigneeId,
    search, dueBefore, dueAfter,
    sortBy = 'createdAt', sortDir = 'desc',
    page = 1, limit = 20,
  } = query
  const skip = (page - 1) * limit

  // Build the access filter — user can only see tasks in projects they belong to
  const projectFilter = {
    OR: [
      { ownerId: userId },
      { members: { some: { userId } } },
    ],
  }

  const where = {
    isArchived: false,
    project: projectFilter,
    ...(projectId  && { projectId }),
    ...(status     && { status }),
    ...(priority   && { priority }),
    ...(assigneeId && { assigneeId }),
    ...(search     && { title: { contains: search, mode: 'insensitive' } }),
    ...(dueBefore  && { dueDate: { lte: new Date(dueBefore) } }),
    ...(dueAfter   && { dueDate: { gte: new Date(dueAfter) } }),
  }

  const orderBy = sortBy === 'priority'
    ? [{ priority: sortDir }, { createdAt: 'desc' }]
    : [{ [sortBy]: sortDir }]

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({ where, skip, take: limit, orderBy, include: TASK_INCLUDE }),
    prisma.task.count({ where }),
  ])

  return {
    tasks,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// ── Get Single ────────────────────────────────────────────────────────────────
export async function getTask(taskId, userId) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      ...TASK_INCLUDE,
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  })
  if (!task) {
    throw new AppError('Task not found.', HTTP.NOT_FOUND, 'TASK_NOT_FOUND')
  }

  // Verify access
  await assertProjectAccess(task.projectId, userId)
  return task
}

// ── Update ────────────────────────────────────────────────────────────────────
export async function updateTask(taskId, userId, data) {
  const task = await assertTaskWriteAccess(taskId, userId)

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title       !== undefined && { title:       data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.columnId    !== undefined && { columnId:    data.columnId }),
      ...(data.assigneeId  !== undefined && { assigneeId:  data.assigneeId }),
      ...(data.status      !== undefined && { status: data.status }),
      ...(data.priority    !== undefined && { priority:    data.priority }),
      ...(data.dueDate     !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
      ...(data.position !== undefined && { position: data.position }),
    },
    include: TASK_INCLUDE,
  })

  return updated
}

// ── Delete ────────────────────────────────────────────────────────────────────
export async function deleteTask(taskId, userId) {
  await assertTaskDeleteAccess(taskId, userId)
  await prisma.task.delete({ where: { id: taskId } })
}
