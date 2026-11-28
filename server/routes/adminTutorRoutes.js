import { Router } from 'express'
import { createAdminTutor, deleteAdminTutor, listAdminTutors, updateAdminTutor } from '../controllers/tutorController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { requireDatabase } from '../config/database.js'

const router = Router()
router.use(requireDatabase, authenticate, authorize('admin'))
router.get('/', listAdminTutors)
router.post('/', createAdminTutor)
router.put('/:id', updateAdminTutor)
router.delete('/:id', deleteAdminTutor)
export default router
