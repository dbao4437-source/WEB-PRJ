import mongoose from 'mongoose'

const classSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tên lớp học là bắt buộc'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Môn học là bắt buộc'],
      trim: true,
    },
    gradeLevel: {
      type: String,
      required: [true, 'Khối lớp là bắt buộc'],
      trim: true,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ID gia sư phụ trách là bắt buộc'],
    },
    fee: {
      type: Number,
      required: [true, 'Học phí là bắt buộc'],
      min: [0, 'Học phí không thể âm'],
    },
    schedule: {
      type: String,
      required: [true, 'Lịch học là bắt buộc'],
      trim: true,
    },
    maxStudents: {
      type: Number,
      required: [true, 'Sĩ số tối đa là bắt buộc'],
      min: [1, 'Sĩ số tối đa phải ít nhất là 1'],
      default: 20,
    },
    currentStudents: {
      type: Number,
      default: 0,
      min: [0, 'Sĩ số hiện tại không thể âm'],
    },
    status: {
      type: String,
      enum: ['open', 'full', 'closed'],
      default: 'open',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

const Class = mongoose.model('Class', classSchema)
export default Class
