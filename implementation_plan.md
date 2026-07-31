# DevTrack Pro — Enterprise Project & Task Management Platform
## Software Architecture Blueprint

> A production-quality SaaS application for individuals and teams to manage projects, tasks, deadlines, and collaboration.

---

## 1. Product Understanding

### What is DevTrack Pro?

DevTrack Pro is a full-stack SaaS platform targeting **students, developers, startup teams, and small companies** who need a lightweight yet powerful alternative to tools like Jira, Asana, or Linear. It combines:

- **Project management** with member-based access control
- **Task tracking** with rich metadata (priority, status, labels, due dates, assignees)
- **Kanban boards** for visual workflow management
- **Analytics dashboards** for productivity insights
- **Real-time collaboration** through a RESTful API-driven architecture

### Core Value Propositions

| Feature | Description |
|---|---|
| Multi-workspace support | Users belong to organizations/teams |
| Role-based access | Owner, Admin, Member, Viewer |
| Kanban + List views | Flexible task visualization |
| Deadline tracking | Overdue alerts, calendar view |
| Analytics | Burndown, velocity, task distribution |
| JWT Auth | Secure, stateless authentication |

---

## 2. Recommended Folder Structure

```
devtrack-pro/
├── client/                        # React + Vite Frontend
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                # Static assets (icons, images, fonts)
│   │   ├── components/            # Reusable UI components
│   │   │   ├── common/            # Button, Input, Modal, Tooltip, Badge, Avatar
│   │   │   ├── layout/            # Sidebar, Navbar, Header, PageWrapper
│   │   │   ├── kanban/            # KanbanBoard, KanbanColumn, TaskCard, DragHandle
│   │   │   ├── tasks/             # TaskForm, TaskDetail, TaskList, TaskFilters
│   │   │   ├── projects/          # ProjectCard, ProjectForm, ProjectHeader
│   │   │   ├── analytics/         # Charts, StatsCard, BurndownChart, ActivityFeed
│   │   │   └── auth/              # LoginForm, RegisterForm, ProtectedRoute
│   │   ├── pages/                 # Route-level page components
│   │   │   ├── auth/              # LoginPage, RegisterPage, ForgotPasswordPage
│   │   │   ├── dashboard/         # DashboardPage
│   │   │   ├── projects/          # ProjectsPage, ProjectDetailPage
│   │   │   ├── kanban/            # KanbanPage
│   │   │   ├── analytics/         # AnalyticsPage
│   │   │   ├── settings/          # SettingsPage, ProfilePage
│   │   │   └── NotFoundPage.jsx
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useProjects.js
│   │   │   ├── useTasks.js
│   │   │   ├── useKanban.js
│   │   │   └── useAnalytics.js
│   │   ├── context/               # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── store/                 # Zustand global state
│   │   │   ├── authStore.js
│   │   │   ├── projectStore.js
│   │   │   ├── taskStore.js
│   │   │   └── uiStore.js
│   │   ├── services/              # API layer (Axios instances)
│   │   │   ├── api.js             # Axios base config, interceptors
│   │   │   ├── authService.js
│   │   │   ├── projectService.js
│   │   │   ├── taskService.js
│   │   │   └── analyticsService.js
│   │   ├── utils/                 # Helper functions
│   │   │   ├── dateUtils.js
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   ├── styles/                # Global CSS + Tailwind config
│   │   │   └── index.css
│   │   ├── router/
│   │   │   └── AppRouter.jsx      # React Router v6 routes
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── server/                        # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # PostgreSQL connection (pg / Knex)
│   │   │   ├── env.js             # Environment variable validation
│   │   │   └── constants.js       # App-wide constants
│   │   ├── controllers/           # Route handler logic
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── project.controller.js
│   │   │   ├── task.controller.js
│   │   │   ├── comment.controller.js
│   │   │   ├── label.controller.js
│   │   │   └── analytics.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js  # JWT verification
│   │   │   ├── role.middleware.js  # RBAC enforcement
│   │   │   ├── validate.middleware.js # Joi/Zod schema validation
│   │   │   ├── rateLimit.middleware.js
│   │   │   └── errorHandler.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── project.routes.js
│   │   │   ├── task.routes.js
│   │   │   ├── comment.routes.js
│   │   │   ├── label.routes.js
│   │   │   └── analytics.routes.js
│   │   ├── services/              # Business logic layer
│   │   │   ├── auth.service.js
│   │   │   ├── project.service.js
│   │   │   ├── task.service.js
│   │   │   └── analytics.service.js
│   │   ├── models/                # SQL query builders / raw queries
│   │   │   ├── user.model.js
│   │   │   ├── project.model.js
│   │   │   ├── task.model.js
│   │   │   ├── comment.model.js
│   │   │   └── label.model.js
│   │   ├── validators/            # Joi/Zod schemas
│   │   │   ├── auth.validator.js
│   │   │   ├── project.validator.js
│   │   │   └── task.validator.js
│   │   └── app.js                 # Express app bootstrap
│   ├── migrations/                # DB migration files (sequential)
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_projects.sql
│   │   ├── 003_create_tasks.sql
│   │   ├── 004_create_comments.sql
│   │   ├── 005_create_labels.sql
│   │   └── 006_create_activity_log.sql
│   ├── seeds/                     # Dev seed data
│   ├── server.js                  # Entry point
│   ├── .env
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 3. Database Tables

### Entity Relationship Overview

```
users ──< project_members >── projects ──< tasks ──< comments
                                   │         │
                                labels   activity_log
                                   │
                              task_labels
```

---

### Table Definitions

#### `users`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | TEXT | NOT NULL |
| avatar_url | TEXT | NULLABLE |
| role | ENUM('admin','user') | DEFAULT 'user' |
| is_verified | BOOLEAN | DEFAULT false |
| refresh_token | TEXT | NULLABLE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

---

#### `projects`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| name | VARCHAR(150) | NOT NULL |
| description | TEXT | NULLABLE |
| owner_id | UUID | FK → users.id |
| status | ENUM('active','archived','completed') | DEFAULT 'active' |
| color | VARCHAR(7) | DEFAULT '#6366f1' (hex color) |
| start_date | DATE | NULLABLE |
| end_date | DATE | NULLABLE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

---

#### `project_members`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| project_id | UUID | FK → projects.id ON DELETE CASCADE |
| user_id | UUID | FK → users.id ON DELETE CASCADE |
| role | ENUM('owner','admin','member','viewer') | DEFAULT 'member' |
| joined_at | TIMESTAMPTZ | DEFAULT NOW() |
| UNIQUE | (project_id, user_id) | |

---

#### `columns` *(Kanban columns)*
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| project_id | UUID | FK → projects.id ON DELETE CASCADE |
| name | VARCHAR(100) | NOT NULL |
| position | INTEGER | NOT NULL |
| color | VARCHAR(7) | NULLABLE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

> Default columns auto-created per project: **Backlog → Todo → In Progress → In Review → Done**

---

#### `tasks`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| project_id | UUID | FK → projects.id ON DELETE CASCADE |
| column_id | UUID | FK → columns.id ON DELETE SET NULL |
| created_by | UUID | FK → users.id |
| assignee_id | UUID | FK → users.id, NULLABLE |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NULLABLE |
| priority | ENUM('none','low','medium','high','urgent') | DEFAULT 'none' |
| status | ENUM('todo','in_progress','in_review','done') | DEFAULT 'todo' |
| position | FLOAT | NOT NULL (for drag-and-drop ordering) |
| due_date | DATE | NULLABLE |
| estimated_hours | DECIMAL(5,2) | NULLABLE |
| actual_hours | DECIMAL(5,2) | NULLABLE |
| is_archived | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

---

#### `labels`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| project_id | UUID | FK → projects.id ON DELETE CASCADE |
| name | VARCHAR(50) | NOT NULL |
| color | VARCHAR(7) | NOT NULL |

---

#### `task_labels` *(junction)*
| Column | Type | Constraints |
|---|---|---|
| task_id | UUID | FK → tasks.id ON DELETE CASCADE |
| label_id | UUID | FK → labels.id ON DELETE CASCADE |
| PRIMARY KEY | (task_id, label_id) | |

---

#### `comments`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| task_id | UUID | FK → tasks.id ON DELETE CASCADE |
| author_id | UUID | FK → users.id |
| content | TEXT | NOT NULL |
| parent_id | UUID | FK → comments.id, NULLABLE (threaded) |
| is_edited | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

---

#### `activity_log`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY |
| project_id | UUID | FK → projects.id ON DELETE CASCADE |
| task_id | UUID | FK → tasks.id ON DELETE SET NULL, NULLABLE |
| actor_id | UUID | FK → users.id |
| action | VARCHAR(100) | NOT NULL (e.g. "task.created", "task.moved") |
| meta | JSONB | NULLABLE (before/after values) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

## 4. Complete REST API List

### Base URL: `/api/v1`

---

#### 🔐 Auth Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login & get JWT | ❌ |
| POST | `/auth/logout` | Invalidate refresh token | ✅ |
| POST | `/auth/refresh` | Refresh access token | ❌ (uses refresh token cookie) |
| POST | `/auth/forgot-password` | Send reset email | ❌ |
| POST | `/auth/reset-password` | Reset with token | ❌ |

---

#### 👤 User Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/users/me` | Get current user profile | ✅ |
| PUT | `/users/me` | Update profile (name, avatar) | ✅ |
| PUT | `/users/me/password` | Change password | ✅ |
| DELETE | `/users/me` | Delete account | ✅ |
| GET | `/users/search?q=` | Search users by name/email | ✅ |

---

#### 📁 Project Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/projects` | List all projects for current user | ✅ |
| POST | `/projects` | Create a new project | ✅ |
| GET | `/projects/:id` | Get single project details | ✅ |
| PUT | `/projects/:id` | Update project (name, desc, status) | ✅ (admin+) |
| DELETE | `/projects/:id` | Delete project | ✅ (owner) |
| GET | `/projects/:id/members` | List project members | ✅ |
| POST | `/projects/:id/members` | Invite member by email | ✅ (admin+) |
| PUT | `/projects/:id/members/:userId` | Update member role | ✅ (owner) |
| DELETE | `/projects/:id/members/:userId` | Remove member | ✅ (admin+) |
| GET | `/projects/:id/activity` | Get project activity log | ✅ |

---

#### 🗂️ Column Endpoints (Kanban)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/projects/:id/columns` | List columns for a project | ✅ |
| POST | `/projects/:id/columns` | Create a new column | ✅ (admin+) |
| PUT | `/projects/:id/columns/:colId` | Rename / recolor column | ✅ (admin+) |
| PATCH | `/projects/:id/columns/reorder` | Reorder columns (positions) | ✅ (admin+) |
| DELETE | `/projects/:id/columns/:colId` | Delete column (tasks → Backlog) | ✅ (admin+) |

---

#### ✅ Task Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/projects/:id/tasks` | List all tasks (filterable) | ✅ |
| POST | `/projects/:id/tasks` | Create a new task | ✅ |
| GET | `/tasks/:taskId` | Get single task detail | ✅ |
| PUT | `/tasks/:taskId` | Full task update | ✅ |
| PATCH | `/tasks/:taskId` | Partial update (e.g. move column) | ✅ |
| PATCH | `/tasks/:taskId/move` | Move task to column + position | ✅ |
| DELETE | `/tasks/:taskId` | Delete task | ✅ (admin+) |
| PATCH | `/tasks/:taskId/archive` | Archive / unarchive task | ✅ |
| POST | `/tasks/:taskId/labels` | Attach label to task | ✅ |
| DELETE | `/tasks/:taskId/labels/:labelId` | Detach label | ✅ |

**Query params for GET `/projects/:id/tasks`:**
`?status=&priority=&assignee=&label=&due_before=&due_after=&search=&page=&limit=`

---

#### 🏷️ Label Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/projects/:id/labels` | List project labels | ✅ |
| POST | `/projects/:id/labels` | Create label | ✅ (admin+) |
| PUT | `/projects/:id/labels/:labelId` | Update label name/color | ✅ (admin+) |
| DELETE | `/projects/:id/labels/:labelId` | Delete label | ✅ (admin+) |

---

#### 💬 Comment Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/tasks/:taskId/comments` | List comments on a task | ✅ |
| POST | `/tasks/:taskId/comments` | Add comment | ✅ |
| PUT | `/comments/:commentId` | Edit comment | ✅ (author) |
| DELETE | `/comments/:commentId` | Delete comment | ✅ (author / admin) |

---

#### 📊 Analytics Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/projects/:id/analytics/summary` | Task counts by status, priority | ✅ |
| GET | `/projects/:id/analytics/burndown` | Burndown chart data | ✅ |
| GET | `/projects/:id/analytics/velocity` | Tasks completed per week | ✅ |
| GET | `/projects/:id/analytics/members` | Per-member task stats | ✅ |
| GET | `/projects/:id/analytics/overdue` | Overdue tasks count | ✅ |
| GET | `/users/me/analytics` | Personal productivity stats | ✅ |

---

## 5. React Component Hierarchy

```
App
├── AuthContext.Provider
│   └── ThemeContext.Provider
│       └── AppRouter
│           ├── PublicRoutes
│           │   ├── LoginPage
│           │   │   └── LoginForm
│           │   │       ├── Input
│           │   │       ├── Button
│           │   │       └── PasswordInput
│           │   ├── RegisterPage
│           │   │   └── RegisterForm
│           │   └── ForgotPasswordPage
│           │
│           └── PrivateRoutes (ProtectedRoute wrapper)
│               └── AppLayout
│                   ├── Sidebar
│                   │   ├── Logo
│                   │   ├── NavItem (Dashboard, Projects, Analytics, Settings)
│                   │   ├── ProjectList (recent projects)
│                   │   └── UserAvatarMenu
│                   ├── TopBar
│                   │   ├── SearchBar
│                   │   ├── NotificationBell
│                   │   └── ThemeToggle
│                   │
│                   └── PageContent (route outlet)
│                       │
│                       ├── DashboardPage
│                       │   ├── WelcomeBanner
│                       │   ├── StatsRow
│                       │   │   └── StatsCard × 4
│                       │   ├── RecentProjects
│                       │   │   └── ProjectCard × n
│                       │   ├── MyTasksWidget
│                       │   │   └── TaskListItem × n
│                       │   └── ActivityFeed
│                       │
│                       ├── ProjectsPage
│                       │   ├── PageHeader (title + CreateProject button)
│                       │   ├── ProjectFilters
│                       │   └── ProjectGrid
│                       │       └── ProjectCard × n
│                       │
│                       ├── ProjectDetailPage
│                       │   ├── ProjectHeader (name, desc, members, actions)
│                       │   ├── ViewToggle (Kanban | List)
│                       │   │
│                       │   ├── KanbanView
│                       │   │   └── KanbanBoard (DnD context)
│                       │   │       └── KanbanColumn × n
│                       │   │           ├── ColumnHeader (name, task count, add)
│                       │   │           └── TaskCard × n (draggable)
│                       │   │               ├── TaskTitle
│                       │   │               ├── PriorityBadge
│                       │   │               ├── LabelChips
│                       │   │               ├── DueDateChip
│                       │   │               └── AssigneeAvatar
│                       │   │
│                       │   └── ListView
│                       │       ├── TaskFilters (priority, assignee, label, date)
│                       │       └── TaskTable
│                       │           └── TaskRow × n
│                       │
│                       ├── TaskDetailModal / TaskDetailPage
│                       │   ├── TaskHeader (title, edit)
│                       │   ├── TaskMetaSidebar
│                       │   │   ├── AssigneePicker
│                       │   │   ├── PrioritySelect
│                       │   │   ├── StatusSelect
│                       │   │   ├── LabelSelector
│                       │   │   ├── DueDatePicker
│                       │   │   └── HoursTracker
│                       │   ├── TaskDescription (rich text / markdown)
│                       │   └── CommentsSection
│                       │       ├── CommentItem × n
│                       │       └── CommentInput
│                       │
│                       ├── AnalyticsPage
│                       │   ├── ProjectSelector
│                       │   ├── SummaryCards (total, done, overdue)
│                       │   ├── TaskStatusChart (Doughnut)
│                       │   ├── BurndownChart (Line)
│                       │   ├── VelocityChart (Bar)
│                       │   └── MemberPerformanceTable
│                       │
│                       └── SettingsPage
│                           ├── ProfileSettings
│                           │   ├── AvatarUpload
│                           │   └── ProfileForm
│                           ├── PasswordSettings
│                           └── ProjectSettings (if inside project)
│                               ├── GeneralTab (name, color, dates)
│                               ├── MembersTab (invite, role change, remove)
│                               └── DangerZone (archive, delete)
```

---

## 6. Application Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │           React + Vite + Tailwind CSS             │  │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────────┐ │  │
│  │  │  Pages   │ │Components│ │  Zustand Store    │ │  │
│  │  └────┬─────┘ └────┬─────┘ └────────┬──────────┘ │  │
│  │       └────────────┴────────────────┘             │  │
│  │                  Services Layer                    │  │
│  │              (Axios + Interceptors)                │  │
│  └───────────────────────┬───────────────────────────┘  │
└──────────────────────────│──────────────────────────────┘
                           │ HTTPS / REST API
┌──────────────────────────▼──────────────────────────────┐
│                  SERVER (Node.js / Express)              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │   Routes    │→ │  Controllers │→ │    Services    │  │
│  └─────────────┘  └──────────────┘  └───────┬────────┘  │
│  ┌─────────────────────────────────┐         │          │
│  │          Middleware Stack        │         │          │
│  │  Auth → RBAC → Validate → Rate  │         │          │
│  │  Limit → ErrorHandler           │         │          │
│  └─────────────────────────────────┘         │          │
│                                    ┌──────────▼────────┐ │
│                                    │     Models /      │ │
│                                    │   Query Builder   │ │
│                                    └──────────┬────────┘ │
└───────────────────────────────────────────────│──────────┘
                                                │
┌───────────────────────────────────────────────▼──────────┐
│                   PostgreSQL Database                     │
│  users │ projects │ project_members │ columns │ tasks    │
│  labels │ task_labels │ comments │ activity_log          │
└──────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| State Management | Zustand | Lightweight, no boilerplate, easy async |
| API Communication | Axios + interceptors | Centralized token refresh, error handling |
| Drag & Drop | `@dnd-kit/core` | Accessible, performant, no jQuery |
| Charts | Recharts | React-native, lightweight, responsive |
| Form Handling | React Hook Form + Zod | Type-safe, performant, minimal re-renders |
| DB Query | `node-postgres (pg)` raw + helpers | Full control, no ORM overhead |
| Validation | Zod (shared FE/BE schemas) | Single source of truth |
| Passwords | bcrypt (12 rounds) | Industry standard |
| Tokens | Access (15 min) + Refresh (7 days) | Secure sliding session |
| CORS | Whitelisted origins only | Security |
| Rate Limiting | `express-rate-limit` | API abuse prevention |

### Security Architecture

```
Request Flow:
  Client → HTTPS → Rate Limiter → CORS → Auth Middleware (JWT verify)
         → Role Middleware (RBAC) → Input Validator → Controller → Service → DB
         ← Response ← Error Handler (sanitized errors, no stack traces in prod)
```

### Token Strategy

```
┌─────────────────────────────────────────────────────┐
│  Login Response:                                    │
│  - accessToken  (JWT, 15min, in Authorization header)│
│  - refreshToken (JWT, 7 days, HttpOnly cookie)      │
│                                                     │
│  Axios Interceptor:                                 │
│  - On 401 → auto-call /auth/refresh → retry request │
│  - On refresh fail → logout + redirect to /login   │
└─────────────────────────────────────────────────────┘
```

---

## 7. Development Plan

### Phase 0 — Project Setup (Day 1)
- [ ] Initialize monorepo structure (`/client`, `/server`)
- [ ] Setup Vite + React + Tailwind CSS
- [ ] Setup Express server with middleware stack
- [ ] Setup PostgreSQL + connection pool
- [ ] Configure `.env` files for both environments
- [ ] Setup ESLint, Prettier for both projects
- [ ] Create base migration runner

### Phase 1 — Database & Auth (Days 2–3)
- [ ] Write and run all SQL migrations
- [ ] Seed dev data (users, projects, tasks)
- [ ] Implement `POST /auth/register` and `POST /auth/login`
- [ ] JWT access + refresh token strategy
- [ ] Auth middleware (protect routes)
- [ ] Frontend: Login + Register pages with React Hook Form
- [ ] Frontend: AuthContext + Zustand authStore
- [ ] Frontend: ProtectedRoute component

### Phase 2 — Projects & Members (Days 4–5)
- [ ] Full CRUD for projects API
- [ ] Project members API (invite, roles, remove)
- [ ] RBAC middleware (owner/admin/member/viewer)
- [ ] Frontend: ProjectsPage (list, create, edit, delete)
- [ ] Frontend: ProjectCard component
- [ ] Frontend: Project settings (members tab)

### Phase 3 — Kanban Columns & Tasks (Days 6–9)
- [ ] Columns API (CRUD + reorder)
- [ ] Tasks API (full CRUD, filters, pagination)
- [ ] Task move API (`PATCH /tasks/:id/move`)
- [ ] Labels API + task_labels junction
- [ ] Comments API (threaded)
- [ ] Activity log (auto-written on task changes)
- [ ] Frontend: KanbanBoard with `@dnd-kit`
- [ ] Frontend: KanbanColumn + TaskCard (draggable)
- [ ] Frontend: TaskDetailModal (full metadata, comments)
- [ ] Frontend: ListView with filters + sort

### Phase 4 — Analytics (Days 10–11)
- [ ] Analytics queries (summary, burndown, velocity, member stats)
- [ ] Frontend: AnalyticsPage with Recharts
- [ ] Personal dashboard stats
- [ ] Overdue task highlighting

### Phase 5 — Polish & Production Prep (Days 12–14)
- [ ] Dashboard page with widgets
- [ ] Activity feed component
- [ ] Search functionality (tasks + projects)
- [ ] Responsive design (mobile-first audit)
- [ ] Toast notifications (success/error)
- [ ] Empty states, loading skeletons
- [ ] Error boundary components
- [ ] API error handling (global + per-form)
- [ ] Rate limiting + helmet.js security headers
- [ ] Environment configs (dev vs. prod)
- [ ] Final UI polish (animations, transitions)

---

## Open Questions

> [!IMPORTANT]
> Please review and confirm these decisions before we begin coding:

1. **Monorepo vs. Separate Repos** — Do you want a single monorepo (`devtrack-pro/`) with `/client` and `/server`, or two separate repositories?

2. **ORM vs. Raw SQL** — I recommended raw `pg` queries with helper functions for maximum control. Would you prefer an ORM like **Prisma** or **Knex.js** query builder instead?

3. **Real-time Updates** — Should the Kanban board update in real-time (using **Socket.io** or **Server-Sent Events**) when teammates move cards, or is page refresh/manual fetch sufficient for v1?

4. **File Attachments** — Should tasks support file/image attachments? This would require **Cloudinary** or **AWS S3** integration.

5. **Email Notifications** — Should we send emails for: task assignments, due date reminders, project invites? (Requires **Nodemailer** + an SMTP provider like SendGrid.)

6. **Deployment Target** — Where do you plan to deploy? (e.g., **Railway, Render, Vercel + Supabase, Docker on VPS**) — This affects how we structure environment configs.

7. **Rich Text in Tasks** — Should task descriptions support rich text (bold, lists, code blocks) via a library like **TipTap**, or is plain markdown/textarea sufficient?
