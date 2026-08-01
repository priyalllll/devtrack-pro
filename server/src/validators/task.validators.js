// server/src/validators/task.validators.js
// ─────────────────────────────────────────────────────────────────────────────
// Zod schemas for Task endpoints.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'

const TASK_STATUSES   = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
const TASK_PRIORITIES = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']

// Helper for optional string fields that might be passed as empty string ""
const optionalUuid = z.string().uuid().optional().nullable().or(z.literal(''))
const optionalString = z.string().optional().nullable().or(z.literal(''))

// ── Create ─────────────────────────────────────────────────────────────────────
export const createTaskSchema = z.object({
  title:       z.string().min(1, 'Title is required').max(200, 'Max 200 characters'),
  description: z.string().max(2000, 'Max 2000 characters').optional().nullable().or(z.literal('')),
  projectId:   z.string().uuid('Invalid project ID'),
  columnId:    optionalUuid,
  assigneeId:  optionalUuid,
  status:      z.enum(TASK_STATUSES).optional(),
  priority:    z.enum(TASK_PRIORITIES).optional(),
  dueDate:     optionalString,
})

// ── Update ─────────────────────────────────────────────────────────────────────
export const updateTaskSchema = z.object({
  title:       z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable().or(z.literal('')),
  columnId:    optionalUuid,
  assigneeId:  optionalUuid,
  status:      z.enum(TASK_STATUSES).optional(),
  priority:    z.enum(TASK_PRIORITIES).optional(),
  dueDate:     optionalString,
  position:    z.number().optional(),
})

// ── List / query ───────────────────────────────────────────────────────────────
export const taskQuerySchema = z.object({
  projectId:  optionalUuid,
  status:     z.enum(TASK_STATUSES).optional(),
  priority:   z.enum(TASK_PRIORITIES).optional(),
  assigneeId: optionalUuid,
  search:     z.string().optional(),
  dueBefore:  z.string().optional(),
  dueAfter:   z.string().optional(),
  sortBy:     z.enum(['createdAt', 'dueDate', 'priority', 'status', 'title']).optional(),
  sortDir:    z.enum(['asc', 'desc']).optional(),
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(100).default(20),
})
