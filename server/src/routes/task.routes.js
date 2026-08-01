// server/src/routes/task.routes.js
// ─────────────────────────────────────────────────────────────────────────────
// Task router — mounted at /api/v1/tasks in app.js.
//
// GET    /api/v1/tasks        → list tasks (filtered, paginated)
// POST   /api/v1/tasks        → create task
// GET    /api/v1/tasks/:id    → get single task
// PUT    /api/v1/tasks/:id    → update task
// DELETE /api/v1/tasks/:id    → delete task
// ─────────────────────────────────────────────────────────────────────────────

import { Router }           from 'express'
import authenticate         from '../middleware/authenticate.middleware.js'
import * as taskController  from '../controllers/task.controller.js'

const router = Router()

router.use(authenticate)

router.get('/',    taskController.listTasks)
router.post('/',   taskController.createTask)
router.get('/:id', taskController.getTask)
router.put('/:id', taskController.updateTask)
router.delete('/:id', taskController.deleteTask)

export default router
