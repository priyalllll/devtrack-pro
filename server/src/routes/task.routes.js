// server/src/routes/task.routes.js
// ─────────────────────────────────────────────────────────────────────────────
// Task router — mounted at /api/v1/tasks in app.js.
// ─────────────────────────────────────────────────────────────────────────────

import { Router }           from 'express'
import authenticate         from '../middleware/authenticate.middleware.js'
import * as taskController  from '../controllers/task.controller.js'
import * as commentController from '../controllers/comment.controller.js'

const router = Router()

router.use(authenticate)

// Task CRUD
router.get('/',       taskController.listTasks)
router.post('/',      taskController.createTask)
router.get('/:id',    taskController.getTask)
router.put('/:id',    taskController.updateTask)
router.delete('/:id', taskController.deleteTask)

// Task Comments
router.get('/:taskId/comments',                      commentController.listComments)
router.post('/:taskId/comments',                     commentController.createComment)
router.delete('/:taskId/comments/:commentId',         commentController.deleteComment)

export default router
