import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true, index: true },
  subject: { type: String, required: true, trim: true },
  grade: { type: String, required: true, trim: true },
  schedule: {
    day: { type: String, required: true, trim: true },
    shift: { type: String, required: true, trim: true },
  },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending', index: true },
  note: { type: String, default: '' },
  teachingFormat: { type: String, enum: ['Online', 'Offline', 'Cả hai'], default: 'Cả hai' },
  hourlyRate: { type: Number, default: 0 },
}, { timestamps: true, versionKey: false })

bookingSchema.index({ tutorId: 1, 'schedule.day': 1, 'schedule.shift': 1 }, { unique: true, partialFilterExpression: { status: 'accepted' } })
bookingSchema.index({ studentId: 1, 'schedule.day': 1, 'schedule.shift': 1 }, { unique: true, partialFilterExpression: { status: 'accepted' } })

export default mongoose.models.BookingRequest || mongoose.model('BookingRequest', bookingSchema)
