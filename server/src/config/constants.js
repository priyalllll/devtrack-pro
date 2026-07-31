// server/src/config/constants.js
// ─────────────────────────────────────────────────────────────────────────────
// App-wide constants shared across the server.
// Centralised here so that changing a value propagates everywhere.
// ─────────────────────────────────────────────────────────────────────────────

// ── API ──────────────────────────────────────────────────────────────────────
export const API_VERSION   = 'v1'
export const API_PREFIX    = `/api/${API_VERSION}`

// ── Pagination Defaults ───────────────────────────────────────────────────────
export const DEFAULT_PAGE       = 1
export const DEFAULT_PAGE_LIMIT = 20
export const MAX_PAGE_LIMIT     = 100

// ── bcrypt ───────────────────────────────────────────────────────────────────
export const BCRYPT_ROUNDS = 12

// ── Project Member Roles ─────────────────────────────────────────────────────
export const MEMBER_ROLES = {
  OWNER:  'OWNER',
  ADMIN:  'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
}

// Roles that can perform write actions (create / update tasks, columns, labels)
export const WRITE_ROLES  = [MEMBER_ROLES.OWNER, MEMBER_ROLES.ADMIN, MEMBER_ROLES.MEMBER]

// Roles that can perform admin actions (delete tasks, manage columns/labels/members)
export const ADMIN_ROLES  = [MEMBER_ROLES.OWNER, MEMBER_ROLES.ADMIN]

// Only the project owner can delete the project or change member roles
export const OWNER_ROLES  = [MEMBER_ROLES.OWNER]

// ── Task Enums ────────────────────────────────────────────────────────────────
export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
export const TASK_PRIORITIES = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']

// ── Project Enums ─────────────────────────────────────────────────────────────
export const PROJECT_STATUSES = ['ACTIVE', 'ARCHIVED', 'COMPLETED']

// ── Default Kanban Columns ────────────────────────────────────────────────────
// These are created automatically when a new project is created.
export const DEFAULT_COLUMNS = [
  { name: 'Backlog',     position: 0, color: '#94a3b8' },
  { name: 'Todo',        position: 1, color: '#3b82f6' },
  { name: 'In Progress', position: 2, color: '#f59e0b' },
  { name: 'In Review',   position: 3, color: '#a855f7' },
  { name: 'Done',        position: 4, color: '#22c55e' },
]

// ── HTTP Status Codes ─────────────────────────────────────────────────────────
export const HTTP = {
  OK:         200,
  CREATED:    201,
  NO_CONTENT: 204,
  BAD_REQUEST:       400,
  UNAUTHORIZED:      401,
  FORBIDDEN:         403,
  NOT_FOUND:         404,
  CONFLICT:          409,
  UNPROCESSABLE:     422,
  INTERNAL_ERROR:    500,
}

// ── Rate Limiter Defaults ─────────────────────────────────────────────────────
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000  // 15 minutes
export const RATE_LIMIT_MAX       = 100              // requests per window

export const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
export const AUTH_RATE_LIMIT_MAX       = 10          // stricter for auth routes
