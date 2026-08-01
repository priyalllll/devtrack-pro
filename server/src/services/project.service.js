// server/src/services/project.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Project business logic.
//
// Authorization model:
//   - Any authenticated user can create a project (becomes OWNER).
//   - List/Get: user must be ownerId OR a ProjectMember.
//   - Update: OWNER or ADMIN role required.
//   - Delete: OWNER only.
// ─────────────────────────────────────────────────────────────────────────────

import prisma  from '../lib/prisma.js'
import { AppError } from '../middleware/errorHandler.middleware.js'
import { HTTP, DEFAULT_COLUMNS } from '../config/constants.js'
import { createNotification } from './notification.service.js'

// ── Shared: access filter ─────────────────────────────────────────────────────
// Returns a Prisma WHERE clause that limits results to projects the user
// can see (owner OR member).
function accessWhere(userId, extra = {}) {
  return {
    OR: [
      { ownerId: userId },
      { members: { some: { userId } } },
    ],
    ...extra,
  }
}

// ── Shared: assert write/admin permission ─────────────────────────────────────
async function assertWriteAccess(projectId, userId, ownerOnly = false) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })
  if (!project) {
    throw new AppError('Project not found.', HTTP.NOT_FOUND, 'PROJECT_NOT_FOUND')
  }

  // Owner always has full access
  if (project.ownerId === userId) return project

  if (ownerOnly) {
    throw new AppError(
      'Only the project owner can perform this action.',
      HTTP.FORBIDDEN,
      'OWNER_REQUIRED',
    )
  }

  // Check for ADMIN role in membership
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { role: true },
  })
  if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
    throw new AppError(
      'You do not have permission to modify this project.',
      HTTP.FORBIDDEN,
      'PROJECT_ACCESS_DENIED',
    )
  }

  return project
}

// ── Create ────────────────────────────────────────────────────────────────────
export async function createProject(userId, data) {
  console.log('Authenticated User ID:', userId)
  console.log('Project Payload:', data)

  if (!userId) {
    throw new AppError('User ID is required to create a project.', HTTP.UNAUTHORIZED, 'UNAUTHORIZED')
  }

  // Strip any accidental owner/ownerId from input data so it cannot pollute Prisma
  const { owner, ownerId, ...cleanData } = data

  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name:        cleanData.name,
        description: cleanData.description ?? null,
        color:       cleanData.color       ?? '#6366f1',
        status:      cleanData.status      ?? 'ACTIVE',
        startDate:   cleanData.startDate   ? new Date(cleanData.startDate) : null,
        endDate:     cleanData.endDate     ? new Date(cleanData.endDate)   : null,
        owner:       { connect: { id: userId } },
      },
      include: {
        _count: { select: { tasks: true, members: true } },
        owner:  { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    // Add creator as OWNER member
    await tx.projectMember.create({
      data: { projectId: project.id, userId, role: 'OWNER' },
    })

    // Auto-create default Kanban columns
    await tx.column.createMany({
      data: DEFAULT_COLUMNS.map((col) => ({
        projectId: project.id,
        name:      col.name,
        position:  col.position,
        color:     col.color,
      })),
    })

    return project
  })
}

// ── List ──────────────────────────────────────────────────────────────────────
export async function listProjects(userId, query) {
  const { status, search, page = 1, limit = 20 } = query
  const skip = (page - 1) * limit

  const where = accessWhere(userId, {
    ...(status  && { status }),
    ...(search  && { name: { contains: search, mode: 'insensitive' } }),
  })

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { tasks: true, members: true } },
        owner:  { select: { id: true, name: true, avatarUrl: true } },
        members: {
          take: 5,
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    }),
    prisma.project.count({ where }),
  ])

  return {
    projects,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// ── Get Single ────────────────────────────────────────────────────────────────
export async function getProject(projectId, userId) {
  const project = await prisma.project.findFirst({
    where: accessWhere(userId, { id: projectId }),
    include: {
      _count:  { select: { tasks: true, members: true } },
      owner:   { select: { id: true, name: true, avatarUrl: true } },
      members: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  })

  if (!project) {
    throw new AppError('Project not found.', HTTP.NOT_FOUND, 'PROJECT_NOT_FOUND')
  }

  return project
}

// ── Update ────────────────────────────────────────────────────────────────────
export async function updateProject(projectId, userId, data) {
  await assertWriteAccess(projectId, userId)

  const { owner, ownerId, ...cleanData } = data

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(cleanData.name        !== undefined && { name:        cleanData.name }),
      ...(cleanData.description !== undefined && { description: cleanData.description }),
      ...(cleanData.color       !== undefined && { color:       cleanData.color }),
      ...(cleanData.status      !== undefined && { status:      cleanData.status }),
      ...(cleanData.startDate   !== undefined && {
        startDate: cleanData.startDate ? new Date(cleanData.startDate) : null,
      }),
      ...(cleanData.endDate !== undefined && {
        endDate: cleanData.endDate ? new Date(cleanData.endDate) : null,
      }),
    },
    include: {
      _count: { select: { tasks: true, members: true } },
      owner:  { select: { id: true, name: true, avatarUrl: true } },
      members: { select: { userId: true } },
    },
  })

  // Trigger PROJECT_UPDATED notification for members
  try {
    const memberUserIds = updated.members.map(m => m.userId).filter(id => id !== userId)
    for (const memberId of memberUserIds) {
      createNotification({
        userId: memberId,
        type: 'PROJECT_UPDATED',
        title: 'Project Updated',
        message: `Project "${updated.name}" details were updated.`,
        link: '/projects',
      }).catch(() => {})
    }
  } catch (err) {}

  return updated
}

// ── Delete ────────────────────────────────────────────────────────────────────
export async function deleteProject(projectId, userId) {
  await assertWriteAccess(projectId, userId, true /* ownerOnly */)
  await prisma.project.delete({ where: { id: projectId } })
}

// ── Dashboard stats ───────────────────────────────────────────────────────────
// Returns real aggregated stats for the authenticated user's projects.
export async function getProjectStats(userId) {
  // All project IDs the user can access
  const accessible = await prisma.project.findMany({
    where: accessWhere(userId),
    select: { id: true },
  })
  const projectIds = accessible.map((p) => p.id)

  if (projectIds.length === 0) {
    return { totalProjects: 0, activeTasks: 0, completedTasks: 0, upcomingDeadlines: 0 }
  }

  const now     = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [activeTasks, completedTasks, upcomingDeadlines] = await Promise.all([
    prisma.task.count({
      where: {
        projectId:  { in: projectIds },
        status:     { in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] },
        isArchived: false,
      },
    }),
    prisma.task.count({
      where: {
        projectId:  { in: projectIds },
        status:     'DONE',
        isArchived: false,
      },
    }),
    prisma.task.count({
      where: {
        projectId:  { in: projectIds },
        dueDate:    { gte: now, lte: in7Days },
        status:     { not: 'DONE' },
        isArchived: false,
      },
    }),
  ])

  return {
    totalProjects: projectIds.length,
    activeTasks,
    completedTasks,
    upcomingDeadlines,
  }
}
