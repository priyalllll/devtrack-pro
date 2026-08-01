// server/src/controllers/dashboard.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Dashboard API handlers — Phase 5 update:
//   All three endpoints now return 100% real DB data.
//   No hardcoded sample data remains.
// ─────────────────────────────────────────────────────────────────────────────

import { HTTP } from '../config/constants.js'
import prisma   from '../lib/prisma.js'
import { getProjectStats } from '../services/project.service.js'

// ── Helpers ───────────────────────────────────────────────────────────────────
function getUserId(req) {
  return req.user?.id || req.user?.userId
}

function dayLabel(daysAgo) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return days[d.getDay()]
}

// ── GET /dashboard/summary ─────────────────────────────────────────────────────
// Returns real stats + real 7-day chart data from the DB.
export async function getSummary(req, res, next) {
  try {
    const userId = getUserId(req)

    // ① Real project/task stats
    const stats = await getProjectStats(userId)

    // ② Productivity %
    const totalTasks = stats.activeTasks + stats.completedTasks
    const productivityPercent = totalTasks > 0
      ? Math.round((stats.completedTasks / totalTasks) * 100)
      : 0

    // ③ Real 7-day chart: tasks created vs completed per day
    // Get all projects this user can access
    const accessible = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      select: { id: true },
    })
    const projectIds = accessible.map((p) => p.id)

    // Build 7 date buckets (today is index 0, 6 days ago is index 6)
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - (6 - i))
      return {
        day:       dayLabel(6 - i),
        dayStart:  new Date(d),
        dayEnd:    new Date(new Date(d).setHours(23, 59, 59, 999)),
        created:   0,
        completed: 0,
      }
    })

    if (projectIds.length > 0) {
      // Fetch tasks created in the last 7 days
      const [createdTasks, completedTasks] = await Promise.all([
        prisma.task.findMany({
          where: {
            projectId: { in: projectIds },
            createdAt:  { gte: buckets[0].dayStart },
          },
          select: { createdAt: true },
        }),
        prisma.task.findMany({
          where: {
            projectId: { in: projectIds },
            status:    'DONE',
            updatedAt:  { gte: buckets[0].dayStart },
          },
          select: { updatedAt: true },
        }),
      ])

      // Bucket by day
      for (const task of createdTasks) {
        const d = new Date(task.createdAt)
        const bucket = buckets.find(
          (b) => d >= b.dayStart && d <= b.dayEnd,
        )
        if (bucket) bucket.created++
      }
      for (const task of completedTasks) {
        const d = new Date(task.updatedAt)
        const bucket = buckets.find(
          (b) => d >= b.dayStart && d <= b.dayEnd,
        )
        if (bucket) bucket.completed++
      }
    }

    const chartData = buckets.map(({ day, created, completed }) => ({
      day, created, completed,
    }))

    // ④ Productivity trend: compare this week vs last week completion rate
    let trendPercent = 0
    if (projectIds.length > 0) {
      const weekStart     = new Date(); weekStart.setDate(weekStart.getDate() - 6); weekStart.setHours(0, 0, 0, 0)
      const lastWeekStart = new Date(); lastWeekStart.setDate(lastWeekStart.getDate() - 13); lastWeekStart.setHours(0, 0, 0, 0)
      const lastWeekEnd   = new Date(); lastWeekEnd.setDate(lastWeekEnd.getDate() - 7); lastWeekEnd.setHours(23, 59, 59, 999)

      const [thisWeekDone, lastWeekDone] = await Promise.all([
        prisma.task.count({
          where: { projectId: { in: projectIds }, status: 'DONE', updatedAt: { gte: weekStart } },
        }),
        prisma.task.count({
          where: { projectId: { in: projectIds }, status: 'DONE', updatedAt: { gte: lastWeekStart, lte: lastWeekEnd } },
        }),
      ])
      if (lastWeekDone > 0) {
        trendPercent = Math.round(((thisWeekDone - lastWeekDone) / lastWeekDone) * 100)
      } else if (thisWeekDone > 0) {
        trendPercent = 100
      }
    }

    return res.status(HTTP.OK).json({
      success: true,
      data: {
        stats,
        productivity: {
          percent: productivityPercent,
          trend:   trendPercent,
        },
        chartData,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /dashboard/activity ────────────────────────────────────────────────────
// Returns the 10 most recent ActivityLog records for the user's projects.
// Falls back to empty array if the activity_logs table is empty.
export async function getActivity(req, res, next) {
  try {
    const userId = getUserId(req)

    // Projects the user can access
    const accessible = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      select: { id: true },
    })
    const projectIds = accessible.map((p) => p.id)

    let activities = []

    if (projectIds.length > 0) {
      const logs = await prisma.activityLog.findMany({
        where:   { projectId: { in: projectIds } },
        orderBy: { createdAt: 'desc' },
        take:    10,
        include: {
          actor:   { select: { id: true, name: true, avatarUrl: true } },
          project: { select: { id: true, name: true, color: true } },
          task:    { select: { id: true, title: true } },
        },
      })

      // Map DB logs → component-friendly shape
      activities = logs.map((log) => ({
        id:          log.id,
        action:      log.action,
        description: buildDescription(log),
        project:     log.project?.name ?? '',
        projectColor:log.project?.color ?? '#6366f1',
        actorName:   log.actor?.name ?? 'Someone',
        actorColor:  '#6366f1',
        createdAt:   log.createdAt,
        meta:        log.meta,
      }))
    }

    // If no activity logs yet, surface recent task/project creation as synthetic activity
    if (activities.length === 0 && projectIds.length > 0) {
      const [recentTasks, recentProjects] = await Promise.all([
        prisma.task.findMany({
          where:   { projectId: { in: projectIds }, isArchived: false },
          orderBy: { createdAt: 'desc' },
          take:    5,
          include: {
            createdBy: { select: { name: true } },
            project:   { select: { name: true, color: true } },
          },
        }),
        prisma.project.findMany({
          where:   { id: { in: projectIds } },
          orderBy: { createdAt: 'desc' },
          take:    3,
          include: { owner: { select: { name: true } } },
        }),
      ])

      const syntheticFromTasks = recentTasks.map((t) => ({
        id:          `task-${t.id}`,
        action:      t.status === 'DONE' ? 'task.completed' : 'task.created',
        description: t.status === 'DONE'
          ? `Completed "${t.title}"`
          : `Created "${t.title}"`,
        project:     t.project?.name ?? '',
        projectColor:t.project?.color ?? '#6366f1',
        actorName:   t.createdBy?.name ?? 'You',
        actorColor:  '#6366f1',
        createdAt:   t.createdAt,
      }))

      const syntheticFromProjects = recentProjects.map((p) => ({
        id:          `project-${p.id}`,
        action:      'project.created',
        description: `Created project "${p.name}"`,
        project:     p.name,
        projectColor:p.color ?? '#6366f1',
        actorName:   p.owner?.name ?? 'You',
        actorColor:  '#6366f1',
        createdAt:   p.createdAt,
      }))

      // Merge + sort by date
      activities = [...syntheticFromTasks, ...syntheticFromProjects]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8)
    }

    return res.status(HTTP.OK).json({
      success: true,
      data: { activities },
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /dashboard/tasks/today ─────────────────────────────────────────────────
// Returns today's tasks + upcoming tasks with due dates in the next 7 days.
export async function getTodaysTasks(req, res, next) {
  try {
    const userId = getUserId(req)

    const accessible = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      select: { id: true },
    })
    const projectIds = accessible.map((p) => p.id)

    let tasks = []

    if (projectIds.length > 0) {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999)

      // Tasks due today OR any open tasks assigned to/created by this user
      const [dueTodayTasks, openAssignedTasks] = await Promise.all([
        // Tasks due today (any user can see in their projects)
        prisma.task.findMany({
          where: {
            projectId:  { in: projectIds },
            isArchived: false,
            dueDate:    { gte: todayStart, lte: todayEnd },
          },
          orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
          take:    10,
          include: {
            project: { select: { id: true, name: true, color: true } },
          },
        }),
        // Open tasks created by or assigned to this user (fallback when no due-today tasks)
        prisma.task.findMany({
          where: {
            projectId:  { in: projectIds },
            isArchived: false,
            status:     { in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] },
            OR: [
              { createdById: userId },
              { assigneeId:  userId },
            ],
          },
          orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
          take:    10,
          include: {
            project: { select: { id: true, name: true, color: true } },
          },
        }),
      ])

      // Merge, deduplicate, limit to 8
      const seen = new Set()
      const merged = [...dueTodayTasks, ...openAssignedTasks].filter((t) => {
        if (seen.has(t.id)) return false
        seen.add(t.id)
        return true
      }).slice(0, 8)

      tasks = merged.map((t) => ({
        id:       t.id,
        title:    t.title,
        priority: t.priority,
        status:   t.status,
        project:  t.project?.name ?? '',
        projectId:t.projectId,
        dueDate:  t.dueDate,
      }))
    }

    return res.status(HTTP.OK).json({
      success: true,
      data: { tasks },
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /dashboard/deadlines ───────────────────────────────────────────────────
// Returns tasks with due dates in the next 14 days, sorted by urgency.
export async function getUpcomingDeadlines(req, res, next) {
  try {
    const userId = getUserId(req)

    const accessible = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      select: { id: true },
    })
    const projectIds = accessible.map((p) => p.id)

    let deadlines = []

    if (projectIds.length > 0) {
      const now       = new Date()
      const in14Days  = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

      const tasks = await prisma.task.findMany({
        where: {
          projectId:  { in: projectIds },
          isArchived: false,
          status:     { not: 'DONE' },
          dueDate:    { lte: in14Days },
        },
        orderBy: { dueDate: 'asc' },
        take:    8,
        include: {
          project: { select: { id: true, name: true, color: true } },
        },
      })

      deadlines = tasks.map((t) => ({
        id:       t.id,
        title:    t.title,
        project:  t.project?.name ?? '',
        projectId:t.projectId,
        dueDate:  t.dueDate,
        priority: t.priority,
        status:   t.status,
      }))
    }

    return res.status(HTTP.OK).json({
      success: true,
      data: { deadlines },
    })
  } catch (err) {
    next(err)
  }
}

// ── Internal: build a human description from an ActivityLog record ─────────────
function buildDescription(log) {
  const taskTitle    = log.task?.title ?? (log.meta?.title ?? 'a task')
  const projectName  = log.project?.name ?? 'a project'
  switch (log.action) {
    case 'task.created':   return `Created "${taskTitle}"`
    case 'task.updated':   return `Updated "${taskTitle}"`
    case 'task.completed': return `Completed "${taskTitle}"`
    case 'task.deleted':   return `Deleted a task in ${projectName}`
    case 'task.moved':     return `Moved "${taskTitle}" to ${log.meta?.after?.status ?? 'a new status'}`
    case 'project.created':return `Created project "${projectName}"`
    case 'project.updated':return `Updated project "${projectName}"`
    case 'comment.added':  return `Commented on "${taskTitle}"`
    case 'member.added':   return `Added a member to ${projectName}`
    default:               return log.action.replace('.', ' ') + ` in ${projectName}`
  }
}
