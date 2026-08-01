// server/src/validators/task.validators.js
// ─────────────────────────────────────────────────────────────────────────────
// Zod schemas for Task endpoints.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'

const TASK_STATUSES   = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
const TASK_PRIORITIES = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']

// ── Create ─────────────────────────────────────────────────────────────────────
export const createTaskSchema = z.object({
  title:       z.string().min(1, 'Title is required').max(200, 'Max 200 characters'),
  description: z.string().max(2000, 'Max 2000 characters').optional(),
  projectId:   z.string().uuid('Invalid project ID'),
  columnId:    z.string().uuid('Invalid column ID').optional(),
  assigneeId:  z.string().uuid('Invalid assignee ID').optional(),
  status:      z.enum(TASK_STATUSES).optional(),
  priority:    z.enum(TASK_PRIORITIES).optional(),
  dueDate:     z.string().optional().nullable(),
})

// ── Update ─────────────────────────────────────────────────────────────────────
export const updateTaskSchema = z.object({
  title:       z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  columnId:    z.string().uuid().optional().nullable(),
  assigneeId:  z.string().uuid().optional().nullable(),
  status:      z.enum(TASK_STATUSES).optional(),
  priority:    z.enum(TASK_PRIORITIES).optional(),
  dueDate:     z.string().optional().nullable(),
  position:    z.number().optional(),
})

// ── List / query ───────────────────────────────────────────────────────────────
export const taskQuerySchema = z.object({
  projectId:  z.string().uuid().optional(),
  status:     z.enum(TASK_STATUSES).optional(),
  priority:   z.enum(TASK_PRIORITIES).optional(),
  assigneeId: z.string().uuid().optional(),
  search:     z.string().optional(),
  dueBefore:  z.string().optional(),
  dueAfter:   z.string().optional(),
  sortBy:     z.enum(['createdAt', 'dueDate', 'priority', 'status', 'title']).optional(),
  sortDir:    z.enum(['asc', 'desc']).optional(),
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(100).default(20),
})
