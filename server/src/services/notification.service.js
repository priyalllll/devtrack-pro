// server/src/services/notification.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Notification business logic.
// Types: TASK_ASSIGNED, TASK_COMPLETED, DEADLINE_APPROACHING, PROJECT_INVITED, PROJECT_UPDATED
// ─────────────────────────────────────────────────────────────────────────────

import prisma from '../lib/prisma.js'
import { AppError } from '../middleware/errorHandler.middleware.js'
import { HTTP } from '../config/constants.js'

// Helper: Create notification for a target user
export async function createNotification({ userId, type, title, message, link = null, meta = null }) {
  if (!userId) return null
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
        meta: meta || {},
      },
    })
  } catch (err) {
    console.error('Failed to create notification:', err)
    return null
  }
}

// ── Get User Notifications ───────────────────────────────────────────────────
export async function getUserNotifications(userId) {
  // Sync auto-generated deadline notifications if any task is due in < 48 hours
  await checkDeadlineNotifications(userId)

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false },
  })

  return {
    notifications,
    unreadCount,
  }
}

// ── Mark Notification as Read ─────────────────────────────────────────────────
export async function markNotificationAsRead(notificationId, userId) {
  const notif = await prisma.notification.findUnique({
    where: { id: notificationId },
  })

  if (!notif || notif.userId !== userId) {
    throw new AppError('Notification not found.', HTTP.NOT_FOUND, 'NOTIF_NOT_FOUND')
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  })
}

// ── Mark All as Read ──────────────────────────────────────────────────────────
export async function markAllNotificationsAsRead(userId) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })
}

// Internal helper: Auto-checks tasks approaching deadline for this user and creates DEADLINE_APPROACHING notification
async function checkDeadlineNotifications(userId) {
  try {
    const now = new Date()
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    // Find tasks due within 48 hours assigned to or created by user
    const tasksDueSoon = await prisma.task.findMany({
      where: {
        isArchived: false,
        status: { not: 'DONE' },
        dueDate: { gte: now, lte: in48Hours },
        OR: [
          { assigneeId: userId },
          { createdById: userId },
          { project: { ownerId: userId } },
        ],
      },
      select: { id: true, title: true, dueDate: true, projectId: true },
      take: 5,
    })

    for (const task of tasksDueSoon) {
      // Check if notification already exists for this task
      const existing = await prisma.notification.findFirst({
        where: {
          userId,
          type: 'DEADLINE_APPROACHING',
          meta: { path: ['taskId'], equals: task.id },
        },
      })

      if (!existing) {
        await createNotification({
          userId,
          type: 'DEADLINE_APPROACHING',
          title: 'Deadline Approaching',
          message: `Task "${task.title}" is due soon (${new Date(task.dueDate).toLocaleDateString()})`,
          link: '/kanban',
          meta: { taskId: task.id },
        })
      }
    }
  } catch (err) {
    console.error('Error checking deadline notifications:', err)
  }
}
