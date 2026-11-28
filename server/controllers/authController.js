import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Tutor from '../models/Tutor.js'
import { findTutorByUserId, normalizeTutorInput, tutorDTO, updateTutor } from '../services/tutorService.js'
import { findUserByEmail, userDTO } from '../services/userService.js'
import { validateTutorInput } from '../services/tutorService.js'

const makeToken = user => jwt.sign({ sub: String(user._id), role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' })
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())

export async function login(req, res, next) {
  try {
    const email = req.body?.loginEmail || req.body?.email
    const password = req.body?.password
    if (!email || !password) return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' })
    const user = await findUserByEmail(email, { includePassword: true })
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' })
    return res.json({ token: makeToken(user), user: userDTO(user) })
  } catch (error) { return next(error) }
}

export async function registerStudent(req, res, next) {
  try {
    const { fullName, email, password, phone, role = 'student' } = req.body || {}
    if (role !== 'student') return res.status(403).json({ message: 'Tài khoản gia sư và quản trị viên do admin cấp.' })
    if (!String(fullName || '').trim() || !validEmail(email) || typeof password !== 'string' || password.length < 8) return res.status(400).json({ message: 'Nhập họ tên, email hợp lệ và mật khẩu tối thiểu 8 ký tự.' })
    const normalizedEmail = email.trim().toLowerCase()
    if (await findUserByEmail(normalizedEmail)) return res.status(409).json({ message: 'Email đã được sử dụng.' })
    const user = await User.create({ loginEmail: normalizedEmail, password: await bcrypt.hash(password, 10), role: 'student', fullName: fullName.trim(), phone: String(phone || '').trim() })
    return res.status(201).json({ token: makeToken(user), user: userDTO(user) })
  } catch (error) { return next(error) }
}

export async function getProfile(req, res, next) {
  try {
    if (req.user.role === 'tutor') {
      const tutor = await findTutorByUserId(req.user.id, { includeLoginEmail: true })
      if (!tutor) return res.status(404).json({ message: 'Không tìm thấy hồ sơ gia sư.' })
      return res.json(tutorDTO(tutor, { includePrivate: true }))
    }
    const user = await User.findById(req.user.id).select('-password').lean()
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' })
    return res.json({ id: String(user._id), fullName: user.fullName, name: user.fullName, email: user.loginEmail, phone: user.phone || '', avatar: user.avatar || '', role: user.role, grade: user.grade || '', parentName: user.parentName || '', parentPhone: user.parentPhone || '' })
  } catch (error) { return next(error) }
}

export async function updateProfile(req, res, next) {
  try {
    if (req.user.role === 'tutor') {
      const tutorDoc = await Tutor.findOne({ userId: req.user.id })
      if (!tutorDoc) return res.status(404).json({ message: 'Không tìm thấy hồ sơ gia sư.' })
      const input = normalizeTutorInput(req.body || {})
      delete input.hourlyRate
      delete input.rating
      const errors = validateTutorInput(input)
      if (errors) return res.status(400).json({ message: Object.values(errors)[0], errors })
      const fields = ['fullName', 'avatar', 'subjects', 'grades', 'areas', 'teachingFormat', 'experienceYears', 'education', 'major', 'certificates', 'phone', 'contactEmail', 'availability', 'bio']
      const updates = Object.fromEntries(Object.entries(input).filter(([key]) => fields.includes(key)))
      Object.assign(tutorDoc, updates)
      await tutorDoc.save()
      await User.findByIdAndUpdate(req.user.id, { fullName: tutorDoc.fullName, avatar: tutorDoc.avatar })
      return res.json(tutorDTO(await Tutor.findById(tutorDoc._id).populate({ path: 'userId', select: 'loginEmail' }), { includePrivate: true }))
    }
    const { fullName, phone, avatar, grade, parentName, parentPhone } = req.body || {}
    if (fullName !== undefined && !String(fullName).trim()) return res.status(400).json({ message: 'Họ tên không được để trống.' })
    const updated = await User.findByIdAndUpdate(req.user.id, { ...(fullName !== undefined ? { fullName: String(fullName).trim() } : {}), ...(phone !== undefined ? { phone: String(phone).trim() } : {}), ...(avatar !== undefined ? { avatar: String(avatar) } : {}), ...(grade !== undefined ? { grade: String(grade).trim() } : {}), ...(parentName !== undefined ? { parentName: String(parentName).trim() } : {}), ...(parentPhone !== undefined ? { parentPhone: String(parentPhone).trim() } : {}) }, { new: true }).select('-password').lean()
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' })
    return res.json({ id: String(updated._id), fullName: updated.fullName, name: updated.fullName, email: updated.loginEmail, phone: updated.phone, avatar: updated.avatar, role: updated.role, grade: updated.grade || '', parentName: updated.parentName || '', parentPhone: updated.parentPhone || '' })
  } catch (error) { return next(error) }
}
