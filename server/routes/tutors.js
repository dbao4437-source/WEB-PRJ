import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { requireDatabase } from '../config/database.js'
import { getMyTutor, getTutor, listAdminTutors, listTutors, updateAvailability, updateMyTutor, updateTutorProfileById } from '../controllers/tutorController.js'
import { uploadImage } from '../middleware/upload.js'

const router = Router()
router.use(requireDatabase)
router.get('/', listTutors)
router.get('/admin', authenticate, authorize('admin'), listAdminTutors)
router.post('/upload/avatar', authenticate, authorize('admin', 'tutor'), uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn ảnh.' })
  return res.status(201).json({ path: `/uploads/${req.file.filename}` })
})
router.get('/me', authenticate, authorize('tutor'), getMyTutor)
router.put('/me', authenticate, authorize('tutor'), updateMyTutor)
router.put('/:id/availability', authenticate, authorize('tutor', 'admin'), updateAvailability)
router.get('/:id', getTutor)
router.put('/:id', authenticate, authorize('tutor'), updateTutorProfileById)
export default router
