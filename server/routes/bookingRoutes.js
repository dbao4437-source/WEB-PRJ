import { Router } from 'express'
import { changeBookingStatus, createBooking, listBookings } from '../controllers/bookingController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { requireDatabase } from '../config/database.js'

const router = Router()
router.use(requireDatabase)
router.post('/', authenticate, authorize('student'), createBooking)
router.get('/', authenticate, authorize('admin', 'tutor', 'student'), listBookings)
router.patch('/:id/:action(approve|reject)', authenticate, authorize('admin', 'tutor'), changeBookingStatus)
export default router
