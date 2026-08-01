// server/src/controllers/dashboard.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Dashboard API handlers.
//
// Phase 4 update:
//   - getSummary() now uses real DB stats via project.service.getProjectStats()
//   - getActivity() and getTodaysTasks() still return sample data until
//     Phase 5 (Task CRUD + ActivityLog) is implemented.
// ─────────────────────────────────────────────────────────────────────────────

import { HTTP } from '../config/constants.js'
import { getProjectStats } from '../services/project.service.js'

// ── Helpers ───────────────────────────────────────────────────────────────────
function dayLabel(daysAgo) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return days[d.getDay()]
}

function minutesAgo(n) {
  return new Date(Date.now() - n * 60_000).toISOString()
}

function todayAt(hour) {
  const d = new Date()
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

// ── GET /dashboard/summary ────────────────────────────────────────────────────
export async function getSummary(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.userId
    // Real project + task stats from DB
    const stats = await getProjectStats(userId)

    // Productivity % — ratio of done tasks to total tasks
    const totalTasks = stats.activeTasks + stats.completedTasks
    const productivityPercent = totalTasks > 0
      ? Math.round((stats.completedTasks / totalTasks) * 100)
      : 0

    // 7-day chart data — sample until Task CRUD (Phase 5) provides time-series data
    const chartData = [
      { day: dayLabel(6), completed: 8,  created: 12 },
      { day: dayLabel(5), completed: 15, created: 10 },
      { day: dayLabel(4), completed: 6,  created: 9  },
      { day: dayLabel(3), completed: 20, created: 18 },
      { day: dayLabel(2), completed: 12, created: 14 },
      { day: dayLabel(1), completed: 4,  created: 6  },
      { day: dayLabel(0), completed: 9,  created: 7  },
    ]

    return res.status(HTTP.OK).json({
      success: true,
      data: {
        stats,
        productivity: {
          percent: productivityPercent,
          trend:   5,
        },
        chartData,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /dashboard/activity ───────────────────────────────────────────────────
export async function getActivity(req, res, next) {
  try {
    const activities = [
      {
        id: '1', action: 'task.completed',
        description: 'Completed "Implement JWT refresh token"',
        project: 'DevTrack Pro', actorName: 'You', actorColor: '#6366f1',
        createdAt: minutesAgo(5),
      },
      {
        id: '2', action: 'task.created',
        description: 'Created "Design dashboard layout"',
        project: 'DevTrack Pro', actorName: 'You', actorColor: '#6366f1',
        createdAt: minutesAgo(32),
      },
      {
        id: '3', action: 'comment.added',
        description: 'Commented on "Set up Prisma ORM"',
        project: 'API Backend', actorName: 'Alex Kim', actorColor: '#3b82f6',
        createdAt: minutesAgo(68),
      },
      {
        id: '4', action: 'project.created',
        description: 'Created project "Mobile App v2"',
        project: 'Mobile App v2', actorName: 'Sarah Lee', actorColor: '#a855f7',
        createdAt: minutesAgo(125),
      },
      {
        id: '5', action: 'task.moved',
        description: 'Moved "Write unit tests" to In Review',
        project: 'API Backend', actorName: 'Alex Kim', actorColor: '#3b82f6',
        createdAt: minutesAgo(185),
      },
      {
        id: '6', action: 'member.added',
        description: 'Added Jordan Wu to DevTrack Pro',
        project: 'DevTrack Pro', actorName: 'You', actorColor: '#6366f1',
        createdAt: minutesAgo(243),
      },
    ]

    return res.status(HTTP.OK).json({
      success: true,
      data: { activities },
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /dashboard/tasks/today ────────────────────────────────────────────────
export async function getTodaysTasks(req, res, next) {
  try {
    const tasks = [
      { id: '1', title: 'Review Phase 4 implementation plan', priority: 'URGENT', status: 'IN_PROGRESS', project: 'DevTrack Pro', dueDate: todayAt(11) },
      { id: '2', title: 'Fix sidebar collapse animation',    priority: 'HIGH',   status: 'TODO',        project: 'DevTrack Pro', dueDate: todayAt(14) },
      { id: '3', title: 'Write API docs for auth',           priority: 'MEDIUM', status: 'TODO',        project: 'API Backend',  dueDate: todayAt(16) },
      { id: '4', title: 'Team standup meeting',              priority: 'LOW',    status: 'DONE',        project: 'General',      dueDate: todayAt(10) },
      { id: '5', title: 'Deploy to staging environment',     priority: 'HIGH',   status: 'IN_REVIEW',   project: 'DevOps',       dueDate: todayAt(18) },
    ]

    return res.status(HTTP.OK).json({
      success: true,
      data: { tasks },
    })
  } catch (err) {
    next(err)
  }
}
