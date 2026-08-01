// server/src/routes/user.routes.js
import { Router } from 'express'
import authenticate from '../middleware/authenticate.middleware.js'
import * as userController from '../controllers/user.controller.js'

const router = Router()

router.use(authenticate)

router.get('/search', userController.searchUsers)

export default router
