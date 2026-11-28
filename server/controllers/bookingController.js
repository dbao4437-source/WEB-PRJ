import BookingRequest from '../models/Booking.js'
import Tutor from '../models/Tutor.js'

const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
const dayNumber = value => Math.max(0, days.indexOf(value))
const statusOut = value => value === 'accepted' ? 'approved' : value
const statusIn = value => value === 'approved' ? 'accepted' : value

function bookingDTO(record) {
  if (!record) return null
  const booking = typeof record.toObject === 'function' ? record.toObject() : record
  const student = booking.studentId && typeof booking.studentId === 'object' ? { _id: String(booking.studentId._id), fullName: booking.studentId.fullName, email: booking.studentId.loginEmail } : String(booking.studentId)
  const tutor = booking.tutorId && typeof booking.tutorId === 'object' ? { _id: String(booking.tutorId._id), fullName: booking.tutorId.fullName } : String(booking.tutorId)
  const schedule = booking.schedule || {}
  return {
    _id: String(booking._id), id: String(booking._id), studentId: student, tutorId: tutor,
    subject: booking.subject, grade: booking.grade, schedule, status: statusOut(booking.status), note: booking.note || '',
    dayOfWeek: dayNumber(schedule.day), timeSlot: schedule.shift,
    teachingMode: booking.teachingFormat === 'Online' ? 'online' : 'offline', fee: booking.hourlyRate || 0,
    createdAt: booking.createdAt,
  }
}

function normalizeSchedule(body) {
  if (body.schedule?.day && body.schedule?.shift) return { day: String(body.schedule.day).trim(), shift: String(body.schedule.shift).trim() }
  const day = Number(body.dayOfWeek)
  const dayName = Number.isInteger(day) ? days[day] : String(body.day || '').trim()
  return { day: dayName, shift: String(body.shift || body.timeSlot || '').trim() }
}

export async function createBooking(req, res, next) {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Chỉ học viên mới có thể gửi yêu cầu học.' })
    const { tutorId, subject, grade, note = '' } = req.body || {}
    if (!tutorId || !String(subject || '').trim() || !String(grade || '').trim()) return res.status(400).json({ message: 'Chọn gia sư, môn học và cấp lớp.' })
    const tutor = await Tutor.findById(tutorId)
    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy gia sư.' })
    if (!tutor.subjects.includes(subject)) return res.status(400).json({ message: 'Gia sư không dạy môn học đã chọn.' })
    if (!tutor.grades.includes(grade)) return res.status(400).json({ message: 'Gia sư không nhận cấp lớp đã chọn.' })
    const schedule = normalizeSchedule(req.body)
    if (!schedule.day || !schedule.shift) return res.status(400).json({ message: 'Vui lòng chọn ngày và ca học.' })
    const available = tutor.availability.some(slot => slot.day === schedule.day && slot.shift === schedule.shift)
    if (!available) return res.status(400).json({ message: 'Khung giờ này không nằm trong lịch rảnh của gia sư.' })
    const selectedFormat = req.body.teachingFormat || req.body.format || (req.body.teachingMode === 'online' ? 'Online' : req.body.teachingMode === 'offline' ? 'Offline' : tutor.teachingFormat)
    if (selectedFormat !== 'Cả hai' && tutor.teachingFormat !== 'Cả hai' && selectedFormat !== tutor.teachingFormat) return res.status(400).json({ message: 'Gia sư không hỗ trợ hình thức học đã chọn.' })
    const booking = await BookingRequest.create({ studentId: req.user.id, tutorId: tutor._id, subject, grade, schedule, note: String(note).trim(), status: 'pending', teachingFormat: selectedFormat, hourlyRate: tutor.hourlyRate })
    return res.status(201).json(bookingDTO(await booking.populate([{ path: 'studentId', select: 'fullName loginEmail' }, { path: 'tutorId', select: 'fullName' }])))
  } catch (error) { next(error) }
}

export async function listBookings(req, res, next) {
  try {
    const filter = {}
    if (req.query.status) filter.status = statusIn(String(req.query.status))
    if (req.user.role === 'student') filter.studentId = req.user.id
    else if (req.user.role === 'tutor') {
      const tutor = await Tutor.findOne({ userId: req.user.id }).select('_id')
      if (!tutor) return res.json([])
      filter.tutorId = tutor._id
    }
    const bookings = await BookingRequest.find(filter).populate({ path: 'studentId', select: 'fullName loginEmail' }).populate({ path: 'tutorId', select: 'fullName' }).sort({ createdAt: -1 })
    return res.json(bookings.map(bookingDTO))
  } catch (error) { next(error) }
}

export async function changeBookingStatus(req, res, next) {
  try {
    const booking = await BookingRequest.findById(req.params.id)
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy yêu cầu học.' })
    if (req.user.role === 'tutor') {
      const tutor = await Tutor.findOne({ userId: req.user.id }).select('_id')
      if (!tutor || String(booking.tutorId) !== String(tutor._id)) return res.status(403).json({ message: 'Gia sư chỉ xử lý yêu cầu gửi đến mình.' })
    } else if (req.user.role !== 'admin') return res.status(403).json({ message: 'Bạn không có quyền duyệt yêu cầu.' })
    if (booking.status !== 'pending') return res.status(409).json({ message: 'Yêu cầu này đã được xử lý.' })
    if (req.params.action === 'approve') {
      const conflict = await BookingRequest.exists({
        _id: { $ne: booking._id }, status: 'accepted',
        $or: [
          { tutorId: booking.tutorId, 'schedule.day': booking.schedule.day, 'schedule.shift': booking.schedule.shift },
          { studentId: booking.studentId, 'schedule.day': booking.schedule.day, 'schedule.shift': booking.schedule.shift },
        ],
      })
      if (conflict) return res.status(409).json({ message: 'Lịch bị trùng với một yêu cầu đã duyệt của gia sư hoặc học viên.' })
      booking.status = 'accepted'
    } else if (req.params.action === 'reject') booking.status = 'rejected'
    else return res.status(400).json({ message: 'Thao tác trạng thái không hợp lệ.' })
    try { await booking.save() } catch (error) { if (error.code === 11000) return res.status(409).json({ message: 'Khung giờ vừa được duyệt cho một lịch khác.' }); throw error }
    await booking.populate([{ path: 'studentId', select: 'fullName loginEmail' }, { path: 'tutorId', select: 'fullName' }])
    return res.json(bookingDTO(booking))
  } catch (error) { next(error) }
}
