// server/src/routes/project.routes.js
// ─────────────────────────────────────────────────────────────────────────────
// Project router — mounted at /api/v1/projects in app.js.
// All routes require a valid JWT (authenticate middleware).
//
// GET    /api/v1/projects        → list all accessible projects (owner/member)
// POST   /api/v1/projects        → create a new project
// GET    /api/v1/projects/:id    → get single project details
// PUT    /api/v1/projects/:id    → update project (OWNER or ADMIN)
// DELETE /api/v1/projects/:id    → delete project (OWNER only)
// ─────────────────────────────────────────────────────────────────────────────

import { Router }            from 'express'
import authenticate          from '../middleware/authenticate.middleware.js'
import * as projectController from '../controllers/project.controller.js'

const router = Router()

// All project routes require authentication
router.use(authenticate)

router.get('/',    projectController.listProjects)
router.post('/',   projectController.createProject)
router.get('/:id', projectController.getProject)
router.put('/:id', projectController.updateProject)
router.delete('/:id', projectController.deleteProject)

export default router
