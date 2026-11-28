import User from '../models/User.js'

export async function findUserByEmail(loginEmail, { includePassword = false } = {}) {
  let query = User.findOne({ loginEmail: String(loginEmail || '').trim().toLowerCase() })
  if (includePassword) query = query.select('+password')
  return query
}
export async function findUserById(id, { includePassword = false } = {}) {
  let query = User.findById(id)
  if (includePassword) query = query.select('+password')
  return query
}
export function userDTO(user) {
  if (!user) return null
  return { id: String(user._id), _id: String(user._id), name: user.fullName, fullName: user.fullName, email: user.loginEmail, loginEmail: user.loginEmail, role: user.role, avatar: user.avatar || '', tutorId: user.role === 'tutor' ? String(user.tutorId || '') : null }
}
export async function listUsers() {
  const users = await User.find().select('-password').sort({ createdAt: -1 }).lean()
  return users.map(user => ({ id: String(user._id), _id: String(user._id), name: user.fullName, email: user.loginEmail, role: user.role, avatar: user.avatar || '' }))
}
export async function updateTutorUser(tutorId, data) {
  const tutorUser = await User.findOne({ tutorId, role: 'tutor' })
  if (!tutorUser) return null
  Object.assign(tutorUser, data)
  await tutorUser.save()
  return tutorUser
}
export async function deleteUser(id) { return User.findByIdAndDelete(id) }
