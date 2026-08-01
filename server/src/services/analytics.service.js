// server/src/services/analytics.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Analytics aggregation logic using optimized Prisma queries.
// Calculates:
//   - Summary stats (Total Projects, Tasks, Completion %, Top Productive Day)
//   - Status distribution breakdown
//   - Priority distribution breakdown
//   - Per-project completion percentage
//   - Tasks created vs completed per week (last 8 weeks)
//   - Most productive days of the week (Sun-Sat)
// ─────────────────────────────────────────────────────────────────────────────

import prisma from '../lib/prisma.js'

export async function getAnalytics(userId) {
  // 1. Get accessible project IDs
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
    select: { id: true, name: true, color: true, status: true },
  })

  const projectIds = projects.map((p) => p.id)

  if (projectIds.length === 0) {
    return {
      summary: {
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        topProductiveDay: 'N/A',
      },
      statusDistribution: [],
      priorityDistribution: [],
      projectCompletion: [],
      weeklyTrend: [],
      mostProductiveDays: [
        { day: 'Sun', completed: 0 },
        { day: 'Mon', completed: 0 },
        { day: 'Tue', completed: 0 },
        { day: 'Wed', completed: 0 },
        { day: 'Thu', completed: 0 },
        { day: 'Fri', completed: 0 },
        { day: 'Sat', completed: 0 },
      ],
    }
  }

  // 2. Status Distribution (grouped query)
  const statusGroup = await prisma.task.groupBy({
    by: ['status'],
    where: { projectId: { in: projectIds }, isArchived: false },
    _count: true,
  })

  const statusMap = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 }
  statusGroup.forEach((item) => {
    if (statusMap[item.status] !== undefined) {
      statusMap[item.status] = item._count
    }
  })

  const statusDistribution = [
    { status: 'TODO',        label: 'Todo',        count: statusMap.TODO,        color: '#3b82f6' },
    { status: 'IN_PROGRESS', label: 'In Progress', count: statusMap.IN_PROGRESS, color: '#f59e0b' },
    { status: 'IN_REVIEW',   label: 'In Review',   count: statusMap.IN_REVIEW,   color: '#a855f7' },
    { status: 'DONE',        label: 'Done',        count: statusMap.DONE,        color: '#22c55e' },
  ]

  // 3. Priority Distribution (grouped query)
  const priorityGroup = await prisma.task.groupBy({
    by: ['priority'],
    where: { projectId: { in: projectIds }, isArchived: false },
    _count: true,
  })

  const priorityMap = { URGENT: 0, HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 }
  priorityGroup.forEach((item) => {
    if (priorityMap[item.priority] !== undefined) {
      priorityMap[item.priority] = item._count
    }
  })

  const priorityDistribution = [
    { priority: 'URGENT', label: 'Urgent', count: priorityMap.URGENT, color: '#ef4444' },
    { priority: 'HIGH',   label: 'High',   count: priorityMap.HIGH,   color: '#f97316' },
    { priority: 'MEDIUM', label: 'Medium', count: priorityMap.MEDIUM, color: '#f59e0b' },
    { priority: 'LOW',    label: 'Low',    count: priorityMap.LOW,    color: '#10b981' },
    { priority: 'NONE',   label: 'None',   count: priorityMap.NONE,   color: '#64748b' },
  ]

  // 4. Project Completion %
  const projectTasksGroup = await prisma.task.groupBy({
    by: ['projectId', 'status'],
    where: { projectId: { in: projectIds }, isArchived: false },
    _count: true,
  })

  const projectStatsMap = {}
  projects.forEach((p) => {
    projectStatsMap[p.id] = {
      id: p.id,
      name: p.name,
      color: p.color || '#6366f1',
      total: 0,
      completed: 0,
    }
  })

  projectTasksGroup.forEach((item) => {
    if (projectStatsMap[item.projectId]) {
      projectStatsMap[item.projectId].total += item._count
      if (item.status === 'DONE') {
        projectStatsMap[item.projectId].completed += item._count
      }
    }
  })

  const projectCompletion = Object.values(projectStatsMap).map((p) => {
    const percentage = p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      total: p.total,
      completed: p.completed,
      completionRate: percentage,
    }
  })

  // 5. Tasks Created vs Completed per week (Last 8 weeks)
  const now = new Date()
  const weeks = []
  for (let i = 7; i >= 0; i--) {
    const start = new Date(now)
    start.setDate(now.getDate() - (i * 7 + 6))
    start.setHours(0, 0, 0, 0)

    const end = new Date(now)
    end.setDate(now.getDate() - (i * 7))
    end.setHours(23, 59, 59, 999)

    const weekLabel = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    weeks.push({ weekLabel, start, end, created: 0, completed: 0 })
  }

  const oldestDate = weeks[0].start

  const [createdTasks, completedTasks] = await Promise.all([
    prisma.task.findMany({
      where: { projectId: { in: projectIds }, createdAt: { gte: oldestDate } },
      select: { createdAt: true },
    }),
    prisma.task.findMany({
      where: { projectId: { in: projectIds }, status: 'DONE', updatedAt: { gte: oldestDate } },
      select: { updatedAt: true },
    }),
  ])

  createdTasks.forEach((task) => {
    const d = new Date(task.createdAt)
    const week = weeks.find((w) => d >= w.start && d <= w.end)
    if (week) week.created++
  })

  completedTasks.forEach((task) => {
    const d = new Date(task.updatedAt)
    const week = weeks.find((w) => d >= w.start && d <= w.end)
    if (week) week.completed++
  })

  const weeklyTrend = weeks.map((w) => ({
    week: w.weekLabel,
    created: w.created,
    completed: w.completed,
  }))

  // 6. Most Productive Days (Sunday to Saturday)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayCounts = [0, 0, 0, 0, 0, 0, 0]

  const allCompletedTasks = await prisma.task.findMany({
    where: { projectId: { in: projectIds }, status: 'DONE' },
    select: { updatedAt: true },
  })

  allCompletedTasks.forEach((task) => {
    const dayIndex = new Date(task.updatedAt).getDay()
    dayCounts[dayIndex]++
  })

  const mostProductiveDays = daysOfWeek.map((day, idx) => ({
    day,
    completed: dayCounts[idx],
  }))

  let maxDayIdx = 0
  let maxCount = -1
  dayCounts.forEach((cnt, idx) => {
    if (cnt > maxCount) {
      maxCount = cnt
      maxDayIdx = idx
    }
  })
  const topProductiveDay = maxCount > 0 ? daysOfWeek[maxDayIdx] : 'N/A'

  // Summary Metrics
  const totalTasks = Object.values(statusMap).reduce((acc, curr) => acc + curr, 0)
  const totalCompleted = statusMap.DONE
  const overallCompletionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0

  return {
    summary: {
      totalProjects: projects.length,
      totalTasks,
      completedTasks: totalCompleted,
      completionRate: overallCompletionRate,
      topProductiveDay,
    },
    statusDistribution,
    priorityDistribution,
    projectCompletion,
    weeklyTrend,
    mostProductiveDays,
  }
}
