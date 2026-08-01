// server/src/routes/project.routes.js
// ─────────────────────────────────────────────────────────────────────────────
// Project router — mounted at /api/v1/projects in app.js.
// All routes require a valid JWT (authenticate middleware).
// ─────────────────────────────────────────────────────────────────────────────

import { Router }            from 'express'
import authenticate          from '../middleware/authenticate.middleware.js'
import * as projectController from '../controllers/project.controller.js'
import * as memberController  from '../controllers/member.controller.js'

const router = Router()

// All project routes require authentication
router.use(authenticate)

// Project CRUD
router.get('/',       projectController.listProjects)
router.post('/',      projectController.createProject)
router.get('/:id',    projectController.getProject)
router.put('/:id',    projectController.updateProject)
router.delete('/:id', projectController.deleteProject)

// Member management
router.get('/:projectId/members',           memberController.listMembers)
router.post('/:projectId/members',          memberController.addMember)
router.patch('/:projectId/members/:memberId', memberController.updateMemberRole)
router.delete('/:projectId/members/:memberId', memberController.removeMember)

export default router
