import Tutor from '../models/Tutor.js'
import User from '../models/User.js'

const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
const oldDayIndex = day => Math.max(0, dayNames.indexOf(day))
const teachingModes = format => format === 'Cả hai' ? ['online', 'offline'] : [format === 'Online' ? 'online' : 'offline']
const publicProjection = '-phone -contactEmail'

export function tutorDTO(document, { includePrivate = false } = {}) {
  if (!document) return null
  const tutor = typeof document.toObject === 'function' ? document.toObject() : { ...document }
  const fullName = tutor.fullName || ''
  const levels = tutor.grades || []
  const dto = {
    id: String(tutor._id || tutor.id), _id: String(tutor._id || tutor.id), userId: String(tutor.userId?._id || tutor.userId || ''),
    name: fullName, fullName, avatar: tutor.avatar || '', subjects: tutor.subjects || [], subjectsTaught: tutor.subjects || [],
    levels, gradeLevels: levels, areas: tutor.areas || [], location: (tutor.areas || []).join(', '),
    mode: tutor.teachingFormat || 'Cả hai', teachingFormat: tutor.teachingFormat || 'Cả hai', teachingModes: teachingModes(tutor.teachingFormat || 'Cả hai'),
    fee: tutor.hourlyRate || 0, hourlyRate: tutor.hourlyRate || 0, rating: tutor.rating ?? 5,
    experienceYears: tutor.experienceYears || 0, bio: tutor.bio || '', education: tutor.education || '', major: tutor.major || '',
    certificates: tutor.certificates || [], availability: tutor.availability || [],
    weeklyAvailability: (tutor.availability || []).map(slot => ({ dayOfWeek: oldDayIndex(slot.day), timeSlot: slot.shift, isBooked: false })),
    teachingStyle: tutor.teachingStyle || '', achievements: tutor.achievements || [],
    stats: tutor.stats || { studentsCount: 0, lessonsCount: 0, responseTime: 'Chưa cập nhật' }, reviews: tutor.reviews || [],
  }
  if (includePrivate) { dto.phone = tutor.phone || ''; dto.contactEmail = tutor.contactEmail || '' }
  if (tutor.userId && typeof tutor.userId === 'object' && tutor.userId.loginEmail) dto.loginEmail = tutor.userId.loginEmail
  return dto
}

export function normalizeTutorInput(body = {}) {
  const output = {}
  const mapping = {
    fullName: body.fullName ?? body.name,
    avatar: body.avatar,
    subjects: body.subjects ?? body.subjectsTaught,
    grades: body.grades ?? body.levels ?? body.gradeLevels,
    areas: body.areas ?? (body.area ? [body.area] : undefined),
    teachingFormat: body.teachingFormat ?? body.mode,
    hourlyRate: body.hourlyRate ?? body.fee,
    rating: body.rating,
    experienceYears: body.experienceYears,
    bio: body.bio,
    education: body.education,
    major: body.major,
    certificates: body.certificates,
    phone: body.phone,
    contactEmail: body.contactEmail,
    availability: body.availability ?? (Array.isArray(body.weeklyAvailability) ? body.weeklyAvailability.map(slot => ({ day: dayNames[Number(slot.dayOfWeek)] || String(slot.dayOfWeek), shift: slot.shift || slot.timeSlot })) : undefined),
    teachingStyle: body.teachingStyle,
    achievements: body.achievements,
    stats: body.stats,
    reviews: body.reviews,
  }
  for (const [key, value] of Object.entries(mapping)) if (value !== undefined) output[key] = value
  return output
}

export function validateTutorInput(input, { requireAll = false } = {}) {
  const errors = {}
  const required = key => requireAll || input[key] !== undefined
  if (required('fullName') && !String(input.fullName || '').trim()) errors.fullName = 'Vui lòng nhập họ tên gia sư.'
  if (required('subjects') && (!Array.isArray(input.subjects) || !input.subjects.length || input.subjects.some(x => typeof x !== 'string' || !x.trim()))) errors.subjects = 'Gia sư cần có ít nhất một môn dạy.'
  if (required('grades') && (!Array.isArray(input.grades) || !input.grades.length)) errors.grades = 'Gia sư cần có ít nhất một cấp lớp.'
  if (required('areas') && (!Array.isArray(input.areas) || !input.areas.length)) errors.areas = 'Gia sư cần có ít nhất một khu vực dạy.'
  if (required('education') && !String(input.education || '').trim()) errors.education = 'Vui lòng cập nhật học vấn.'
  if (required('phone') && !String(input.phone || '').trim()) errors.phone = 'Vui lòng nhập số điện thoại.'
  if (required('contactEmail') && !String(input.contactEmail || '').trim()) errors.contactEmail = 'Vui lòng nhập email liên hệ.'
  if (required('hourlyRate') && (!Number.isFinite(Number(input.hourlyRate)) || Number(input.hourlyRate) <= 0)) errors.hourlyRate = 'Học phí phải là số dương.'
  if (input.teachingFormat !== undefined && !['Online', 'Offline', 'Cả hai'].includes(input.teachingFormat)) errors.teachingFormat = 'Hình thức dạy không hợp lệ.'
  if (input.experienceYears !== undefined && (!Number.isFinite(Number(input.experienceYears)) || Number(input.experienceYears) < 0)) errors.experienceYears = 'Số năm kinh nghiệm không hợp lệ.'
  if (input.phone !== undefined && !/^(?:0(?:3|5|7|8|9)\d{8}|\+84(?:3|5|7|8|9)\d{8})$/.test(String(input.phone).replace(/[\s.\-()]/g, ''))) errors.phone = 'Số điện thoại Việt Nam không hợp lệ.'
  if (input.contactEmail !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(input.contactEmail).trim())) errors.contactEmail = 'Email liên hệ không hợp lệ.'
  if (input.availability !== undefined && (!Array.isArray(input.availability) || input.availability.some(slot => !slot?.day || !slot?.shift))) errors.availability = 'Mỗi khung giờ cần có ngày và ca.'
  return Object.keys(errors).length ? errors : null
}

export async function findPublicTutors(filters = {}) {
  const and = []
  const keyword = String(filters.keyword || '').trim()
  if (keyword) {
    const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    and.push({ $or: [{ fullName: regex }, { subjects: regex }, { certificates: regex }, { major: regex }, { teachingStyle: regex }] })
  }
  if (filters.subject) and.push({ subjects: filters.subject })
  if (filters.grade) and.push({ grades: filters.grade })
  if (filters.area) and.push({ areas: new RegExp(String(filters.area).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })
  if (filters.format && filters.format !== 'Cả hai') and.push({ teachingFormat: { $in: [filters.format, 'Cả hai'] } })
  if (filters.day && filters.shift) and.push({ availability: { $elemMatch: { day: filters.day, shift: filters.shift } } })
  else if (filters.day) and.push({ 'availability.day': filters.day })
  else if (filters.shift) and.push({ 'availability.shift': filters.shift })
  if (filters.minFee) and.push({ hourlyRate: { $gte: Number(filters.minFee) } })
  if (filters.maxFee) and.push({ hourlyRate: { $lte: Number(filters.maxFee) } })
  const sortMap = { 'fee-asc': { hourlyRate: 1 }, 'fee-desc': { hourlyRate: -1 }, 'rating-desc': { rating: -1 }, 'rating-asc': { rating: 1 }, 'experience-desc': { experienceYears: -1 } }
  const sort = sortMap[filters.sort] || { createdAt: 1, _id: 1 }
  const query = and.length ? { $and: and } : {}
  const records = await Tutor.find(query).select(publicProjection).sort(sort).lean()
  return records.map(tutor => tutorDTO(tutor))
}

export async function findTutorById(id, { includePrivate = false, includeLoginEmail = false } = {}) {
  let query = Tutor.findById(id)
  if (!includePrivate) query = query.select(publicProjection)
  if (includeLoginEmail) query = query.populate({ path: 'userId', select: 'loginEmail' })
  const tutor = await query.lean()
  return tutorDTO(tutor, { includePrivate })
}

export async function findTutorDocumentById(id) { return Tutor.findById(id) }
export async function findTutorByUserId(userId, { includeLoginEmail = false } = {}) {
  let query = Tutor.findOne({ userId })
  if (includeLoginEmail) query = query.populate({ path: 'userId', select: 'loginEmail' })
  return query.lean()
}
export async function findAdminTutors() {
  const records = await Tutor.find().populate({ path: 'userId', select: 'loginEmail' }).sort({ fullName: 1 }).lean()
  return records.map(tutor => tutorDTO(tutor, { includePrivate: true }))
}
export async function createTutor(data) { const tutor = await Tutor.create(data); return tutorDTO(tutor, { includePrivate: true }) }
export async function updateTutor(id, data) { const tutor = await Tutor.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate({ path: 'userId', select: 'loginEmail' }).lean(); return tutorDTO(tutor, { includePrivate: true }) }
export async function deleteTutor(id) { return Tutor.findByIdAndDelete(id) }

export async function contactConflict({ phone, contactEmail }, exceptId = null) {
  const or = []
  if (phone) or.push({ phone: String(phone).replace(/[\s.\-()]/g, '') })
  if (contactEmail) or.push({ contactEmail: String(contactEmail).trim().toLowerCase() })
  if (!or.length) return null
  const filter = { $or: or }
  if (exceptId) filter._id = { $ne: exceptId }
  return Tutor.exists(filter)
}

export { dayNames }
