// server/src/validators/project.validators.js
// ─────────────────────────────────────────────────────────────────────────────
// Zod schemas for Project endpoints.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

// ── Create ─────────────────────────────────────────────────────────────────────
export const createProjectSchema = z.object({
  name:        z.string().min(1, 'Project name is required').max(80, 'Max 80 characters'),
  description: z.string().max(500, 'Max 500 characters').optional(),
  color:       z.string().regex(HEX_COLOR, 'Must be a valid hex color').optional(),
  status:      z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).optional(),
  startDate:   z.string().optional().nullable(),
  endDate:     z.string().optional().nullable(),
})

// ── Update ─────────────────────────────────────────────────────────────────────
export const updateProjectSchema = createProjectSchema.partial()

// ── List / query ───────────────────────────────────────────────────────────────
export const projectQuerySchema = z.object({
  status:  z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).optional(),
  search:  z.string().optional(),
  page:    z.coerce.number().int().min(1).default(1),
  limit:   z.coerce.number().int().min(1).max(100).default(20),
})
