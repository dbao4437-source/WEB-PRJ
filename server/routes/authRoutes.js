import { Router } from 'express'
import { getProfile, login, registerStudent, updateProfile } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import { requireDatabase } from '../config/database.js'

const router = Router()
router.use(requireDatabase)
router.post('/login', login)
router.post('/register', registerStudent)
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, updateProfile)
export default router
