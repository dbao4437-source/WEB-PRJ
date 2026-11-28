import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import Tutor from '../models/Tutor.js'
import BookingRequest from '../models/Booking.js'

export async function resetPassword(req, res, next) {
  try {
    const password = req.body?.password ?? req.body?.newPassword
    if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' })
    const user = await User.findById(req.params.userId)
    if (!user || user.role !== 'tutor') return res.status(404).json({ message: 'Không tìm thấy tài khoản gia sư.' })
    user.password = await bcrypt.hash(password, 10)
    await user.save()
    return res.json({ message: 'Đã đặt lại mật khẩu.' })
  } catch (error) { return next(error) }
}

export async function usersList(_req, res, next) {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean()
    return res.json(users.map(user => ({ id: String(user._id), _id: String(user._id), name: user.fullName, fullName: user.fullName, email: user.loginEmail, role: user.role, avatar: user.avatar || '' })))
  } catch (error) { return next(error) }
}

export async function removeUser(req, res, next) {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' })
    if (user.role === 'admin') return res.status(403).json({ message: 'Không thể xóa tài khoản quản trị viên qua thao tác này.' })
    await BookingRequest.deleteMany({ $or: [{ studentId: user._id }, ...(user.tutorId ? [{ tutorId: user.tutorId }] : [])] })
    if (user.tutorId) await Tutor.findByIdAndDelete(user.tutorId)
    await user.deleteOne()
    return res.status(204).end()
  } catch (error) { return next(error) }
}
