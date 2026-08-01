// server/src/services/member.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Project Members management service.
// Handles adding members, listing members, updating roles, and removing members.
// ─────────────────────────────────────────────────────────────────────────────

import prisma from '../lib/prisma.js'
import { AppError } from '../middleware/errorHandler.middleware.js'
import { HTTP } from '../config/constants.js'

// Helper: Assert user is Owner or Admin of the project
async function assertMemberAdminAccess(projectId, userId, ownerOnly = false) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })
  if (!project) {
    throw new AppError('Project not found.', HTTP.NOT_FOUND, 'PROJECT_NOT_FOUND')
  }

  if (project.ownerId === userId) return project

  if (ownerOnly) {
    throw new AppError('Only the project owner can perform this action.', HTTP.FORBIDDEN, 'OWNER_REQUIRED')
  }

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { role: true },
  })

  if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
    throw new AppError('You do not have permission to manage members for this project.', HTTP.FORBIDDEN, 'MEMBER_ACCESS_DENIED')
  }
  return project
}

// ── List Project Members ───────────────────────────────────────────────────────
export async function listProjectMembers(projectId, userId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
        orderBy: { joinedAt: 'asc' },
      },
    },
  })

  if (!project) {
    throw new AppError('Project not found.', HTTP.NOT_FOUND, 'PROJECT_NOT_FOUND')
  }

  // Verify requester is owner or member
  const isOwner = project.ownerId === userId
  const isMember = project.members.some((m) => m.userId === userId)

  if (!isOwner && !isMember) {
    throw new AppError('Access denied to project members.', HTTP.FORBIDDEN, 'PROJECT_ACCESS_DENIED')
  }

  // Format response including owner as the primary member
  const ownerMember = {
    id: `owner-${project.owner.id}`,
    projectId: project.id,
    userId: project.owner.id,
    role: 'OWNER',
    joinedAt: project.createdAt,
    user: project.owner,
    isOwner: true,
  }

  const formattedMembers = project.members.map((m) => ({
    id: m.id,
    projectId: m.projectId,
    userId: m.userId,
    role: m.role,
    joinedAt: m.joinedAt,
    user: m.user,
    isOwner: false,
  }))

  return [ownerMember, ...formattedMembers]
}

// ── Add / Invite Member by Email ───────────────────────────────────────────────
export async function addProjectMember(projectId, currentUserId, { email, role = 'MEMBER' }) {
  await assertMemberAdminAccess(projectId, currentUserId)

  // Find user by email
  const targetUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, name: true, email: true, avatarUrl: true },
  })

  if (!targetUser) {
    throw new AppError(`No user found with email "${email}". Make sure they have a DevTrack Pro account.`, HTTP.NOT_FOUND, 'USER_NOT_FOUND')
  }

  // Check if target user is project owner
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } })
  if (project.ownerId === targetUser.id) {
    throw new AppError('User is already the project owner.', HTTP.BAD_REQUEST, 'ALREADY_OWNER')
  }

  // Check if already a member
  const existingMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: targetUser.id } },
  })

  if (existingMember) {
    throw new AppError('User is already a member of this project.', HTTP.CONFLICT, 'ALREADY_MEMBER')
  }

  // Create membership
  const newMember = await prisma.projectMember.create({
    data: {
      projectId,
      userId: targetUser.id,
      role: role.toUpperCase(),
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  })

  // Create ActivityLog
  try {
    await prisma.activityLog.create({
      data: {
        projectId,
        actorId: currentUserId,
        action: 'member.added',
        meta: { addedUserId: targetUser.id, addedUserEmail: targetUser.email, role: newMember.role },
      },
    })
  } catch (err) {
    console.error('Failed to log member.added activity:', err)
  }

  return {
    id: newMember.id,
    projectId: newMember.projectId,
    userId: newMember.userId,
    role: newMember.role,
    joinedAt: newMember.joinedAt,
    user: newMember.user,
    isOwner: false,
  }
}

// ── Update Member Role ────────────────────────────────────────────────────────
export async function updateMemberRole(projectId, currentUserId, memberId, newRole) {
  // Only project owner can change roles
  await assertMemberAdminAccess(projectId, currentUserId, true /* ownerOnly */)

  const existingMember = await prisma.projectMember.findUnique({
    where: { id: memberId },
  })

  if (!existingMember || existingMember.projectId !== projectId) {
    throw new AppError('Member record not found.', HTTP.NOT_FOUND, 'MEMBER_NOT_FOUND')
  }

  const updated = await prisma.projectMember.update({
    where: { id: memberId },
    data: { role: newRole.toUpperCase() },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  })

  return {
    id: updated.id,
    projectId: updated.projectId,
    userId: updated.userId,
    role: updated.role,
    joinedAt: updated.joinedAt,
    user: updated.user,
    isOwner: false,
  }
}

// ── Remove Member ─────────────────────────────────────────────────────────────
export async function removeProjectMember(projectId, currentUserId, memberId) {
  await assertMemberAdminAccess(projectId, currentUserId)

  const existingMember = await prisma.projectMember.findUnique({
    where: { id: memberId },
  })

  if (!existingMember || existingMember.projectId !== projectId) {
    throw new AppError('Member record not found.', HTTP.NOT_FOUND, 'MEMBER_NOT_FOUND')
  }

  await prisma.projectMember.delete({
    where: { id: memberId },
  })
}
