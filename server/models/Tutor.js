import mongoose from 'mongoose'

const availabilitySchema = new mongoose.Schema({
  day: { type: String, required: true, trim: true },
  shift: { type: String, required: true, trim: true },
}, { _id: false })

const reviewSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, required: true },
  comment: { type: String, required: true },
  date: { type: String, default: '' },
}, { _id: false })

const tutorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  fullName: { type: String, required: true, trim: true },
  avatar: { type: String, default: '' },
  subjects: { type: [String], required: true, validate: values => values.length > 0 },
  grades: { type: [String], required: true, validate: values => values.length > 0 },
  areas: { type: [String], default: [] },
  teachingFormat: { type: String, enum: ['Online', 'Offline', 'Cả hai'], default: 'Cả hai' },
  hourlyRate: { type: Number, required: true, min: 1 },
  rating: { type: Number, default: 5, min: 0, max: 5 },
  experienceYears: { type: Number, default: 0, min: 0 },
  bio: { type: String, default: '' },
  education: { type: String, default: '' },
  major: { type: String, default: '' },
  certificates: { type: [String], default: [] },
  phone: { type: String, required: true, trim: true },
  contactEmail: { type: String, required: true, lowercase: true, trim: true },
  availability: { type: [availabilitySchema], default: [] },
  teachingStyle: { type: String, default: '' },
  achievements: { type: [String], default: [] },
  stats: {
    studentsCount: { type: Number, default: 0 },
    lessonsCount: { type: Number, default: 0 },
    responseTime: { type: String, default: 'Chưa cập nhật' },
  },
  reviews: { type: [reviewSchema], default: [] },
}, { timestamps: true, versionKey: false })

tutorSchema.index({ subjects: 1 })
tutorSchema.index({ grades: 1 })
tutorSchema.index({ areas: 1 })
tutorSchema.index({ hourlyRate: 1, rating: -1, experienceYears: -1 })
tutorSchema.index({ phone: 1 }, { unique: true })
tutorSchema.index({ contactEmail: 1 }, { unique: true })

export default mongoose.models.Tutor || mongoose.model('Tutor', tutorSchema)
