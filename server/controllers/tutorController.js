import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import Tutor from '../models/Tutor.js'
import { contactConflict, createTutor, deleteTutor, findAdminTutors, findPublicTutors, findTutorById, findTutorByUserId, normalizeTutorInput, tutorDTO, updateTutor, validateTutorInput } from '../services/tutorService.js'

const emailIsValid = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
const cleanContact = input => ({ ...input, ...(input.phone !== undefined ? { phone: String(input.phone).replace(/[\s.\-()]/g, '') } : {}), ...(input.contactEmail !== undefined ? { contactEmail: String(input.contactEmail).trim().toLowerCase() } : {}) })

export async function listTutors(req, res, next) {
  try {
    const dayValue = req.query.day ?? req.query.dayOfWeek
    const legacyDays = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    const day = dayValue !== undefined && /^\d$/.test(String(dayValue)) ? legacyDays[Number(dayValue)] : dayValue
    const rawFormat = req.query.format || req.query.mode || req.query.teachingMode
    const format = rawFormat === 'online' ? 'Online' : rawFormat === 'offline' ? 'Offline' : rawFormat
    res.json(await findPublicTutors({ keyword: req.query.keyword || req.query.q || req.query.search, subject: req.query.subject, grade: req.query.grade || req.query.level, area: req.query.area || req.query.location, format, day, shift: req.query.shift || req.query.timeSlot, minFee: req.query.minFee, maxFee: req.query.maxFee, sort: req.query.sort }))
  } catch (error) { next(error) }
}
export async function getTutor(req, res, next) {
  try {
    const tutor = await findTutorById(req.params.id)
    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy gia sư.' })
    return res.json(tutor)
  } catch (error) { next(error) }
}
export async function getMyTutor(req, res, next) {
  try {
    const tutor = await findTutorByUserId(req.user.id, { includeLoginEmail: true })
    if (!tutor) return res.status(404).json({ message: 'Tài khoản chưa có hồ sơ gia sư.' })
    return res.json(tutorDTO(tutor, { includePrivate: true }))
  } catch (error) { next(error) }
}
export async function updateMyTutor(req, res, next) {
  try {
    const current = await Tutor.findOne({ userId: req.user.id })
    if (!current) return res.status(404).json({ message: 'Tài khoản chưa có hồ sơ gia sư.' })
    const input = cleanContact(normalizeTutorInput(req.body || {}))
    delete input.hourlyRate
    delete input.rating
    const errors = validateTutorInput(input)
    if (errors) return res.status(400).json({ message: Object.values(errors)[0], errors })
    if (await contactConflict(input, current._id)) return res.status(409).json({ message: 'Số điện thoại hoặc email liên hệ đã được gia sư khác sử dụng.' })
    const allowed = ['fullName', 'avatar', 'subjects', 'grades', 'areas', 'teachingFormat', 'experienceYears', 'education', 'major', 'certificates', 'phone', 'contactEmail', 'availability', 'bio']
    Object.assign(current, Object.fromEntries(Object.entries(input).filter(([key]) => allowed.includes(key))))
    await current.save()
    await User.findByIdAndUpdate(req.user.id, { fullName: current.fullName, avatar: current.avatar })
    const updated = await Tutor.findById(current._id).populate({ path: 'userId', select: 'loginEmail' })
    return res.json(tutorDTO(updated, { includePrivate: true }))
  } catch (error) { next(error) }
}
export async function updateTutorProfileById(req, res, next) {
  try {
    if (req.user.role === 'admin') return res.status(400).json({ message: 'Admin hãy dùng /api/admin/tutors/:id để chỉnh sửa hồ sơ.' })
    const current = await Tutor.findById(req.params.id)
    if (!current) return res.status(404).json({ message: 'Không tìm thấy gia sư.' })
    if (req.user.role !== 'tutor' || String(current.userId) !== req.user.id) return res.status(403).json({ message: 'Gia sư chỉ được sửa hồ sơ của chính mình.' })
    req.params.id = String(current._id)
    req.user.tutorId = String(current._id)
    return updateMyTutor(req, res, next)
  } catch (error) { next(error) }
}
export async function updateAvailability(req, res, next) {
  try {
    const tutor = await Tutor.findById(req.params.id)
    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy gia sư.' })
    if (req.user.role !== 'admin' && String(tutor.userId) !== req.user.id) return res.status(403).json({ message: 'Bạn chỉ được sửa lịch rảnh của chính mình.' })
    const availability = req.body?.availability
    const errors = validateTutorInput({ availability })
    if (errors) return res.status(400).json({ message: errors.availability, errors })
    tutor.availability = availability
    await tutor.save()
    return res.json(tutorDTO(tutor))
  } catch (error) { next(error) }
}

export async function listAdminTutors(_req, res, next) { try { return res.json(await findAdminTutors()) } catch (error) { next(error) } }
export async function createAdminTutor(req, res, next) {
  let account
  try {
    const body = req.body || {}
    const loginEmail = String(body.loginEmail || '').trim().toLowerCase()
    const password = body.loginPassword
    if (!emailIsValid(loginEmail)) return res.status(400).json({ message: 'Email đăng nhập không hợp lệ.' })
    if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ message: 'Mật khẩu ban đầu cần ít nhất 6 ký tự.' })
    if (await User.exists({ loginEmail })) return res.status(409).json({ message: 'Email đăng nhập đã được sử dụng.' })
    const tutorInput = cleanContact(normalizeTutorInput(body))
    tutorInput.hourlyRate = Number(body.hourlyRate ?? body.fee)
    const errors = validateTutorInput(tutorInput, { requireAll: true })
    if (errors) return res.status(400).json({ message: Object.values(errors)[0], errors })
    if (await contactConflict(tutorInput)) return res.status(409).json({ message: 'Số điện thoại hoặc email liên hệ đã được gia sư khác sử dụng.' })
    if (!Number.isFinite(tutorInput.hourlyRate) || tutorInput.hourlyRate <= 0) return res.status(400).json({ message: 'Học phí phải là số dương.' })
    account = await User.create({ loginEmail, password: await bcrypt.hash(password, 10), role: 'tutor', fullName: tutorInput.fullName, avatar: tutorInput.avatar || '' })
    const tutor = await createTutor({ ...tutorInput, userId: account._id })
    account.tutorId = tutor.id
    await account.save()
    return res.status(201).json({ ...tutor, userId: String(account._id), loginEmail })
  } catch (error) {
    if (account?._id) await User.findByIdAndDelete(account._id).catch(() => {})
    if (error.code === 11000) return res.status(409).json({ message: 'Email hoặc thông tin gia sư đã tồn tại.' })
    return next(error)
  }
}
export async function updateAdminTutor(req, res, next) {
  try {
    const current = await Tutor.findById(req.params.id)
    if (!current) return res.status(404).json({ message: 'Không tìm thấy gia sư.' })
    const body = req.body || {}
    const tutorInput = cleanContact(normalizeTutorInput(body))
    delete tutorInput.hourlyRate
    const errors = validateTutorInput({ ...tutorInput, hourlyRate: body.hourlyRate ?? body.fee })
    if (errors) return res.status(400).json({ message: Object.values(errors)[0], errors })
    if (await contactConflict(tutorInput, current._id)) return res.status(409).json({ message: 'Số điện thoại hoặc email liên hệ đã được gia sư khác sử dụng.' })
    const loginEmail = String(body.loginEmail || '').trim().toLowerCase()
    if (!emailIsValid(loginEmail)) return res.status(400).json({ message: 'Email đăng nhập không hợp lệ.' })
    const otherUser = await User.findOne({ loginEmail, _id: { $ne: current.userId } })
    if (otherUser) return res.status(409).json({ message: 'Email đăng nhập đã được sử dụng.' })
    const account = await User.findById(current.userId)
    if (!account) return res.status(409).json({ message: 'Tài khoản gia sư chưa được liên kết.' })
    const allowed = ['fullName', 'avatar', 'subjects', 'grades', 'areas', 'teachingFormat', 'hourlyRate', 'rating', 'experienceYears', 'bio', 'education', 'major', 'certificates', 'phone', 'contactEmail', 'availability', 'teachingStyle', 'achievements', 'stats', 'reviews']
    const updates = Object.fromEntries(Object.entries(tutorInput).filter(([key]) => allowed.includes(key)))
    if (body.hourlyRate !== undefined || body.fee !== undefined) updates.hourlyRate = Number(body.hourlyRate ?? body.fee)
    Object.assign(current, updates)
    account.loginEmail = loginEmail
    account.fullName = current.fullName
    account.avatar = current.avatar || ''
    await Promise.all([current.save(), account.save()])
    return res.json({ ...tutorDTO(current, { includePrivate: true }), loginEmail, userId: String(account._id) })
  } catch (error) { if (error.code === 11000) return res.status(409).json({ message: 'Email hoặc thông tin gia sư đã tồn tại.' }); next(error) }
}
export async function deleteAdminTutor(req, res, next) {
  try {
    const tutor = await deleteTutor(req.params.id)
    if (!tutor) return res.status(404).json({ message: 'Không tìm thấy gia sư.' })
    await User.findByIdAndDelete(tutor.userId)
    return res.status(204).end()
  } catch (error) { next(error) }
}
