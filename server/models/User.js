import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  loginEmail: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'tutor', 'student'], required: true, index: true },
  fullName: { type: String, required: true, trim: true },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  grade: { type: String, default: '' },
  parentName: { type: String, default: '' },
  parentPhone: { type: String, default: '' },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', default: null, index: true },
}, { timestamps: true, versionKey: false })

export default mongoose.models.User || mongoose.model('User', userSchema)
