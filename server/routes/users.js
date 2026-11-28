import { Router } from 'express'
import { resetPassword, removeUser, usersList } from '../controllers/userController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { requireDatabase } from '../config/database.js'

const router = Router()
router.use(requireDatabase, authenticate, authorize('admin'))
router.get('/', usersList)
router.put('/:userId/password', resetPassword)
router.delete('/:userId', removeUser)
export default router
