import mongoose from 'mongoose'

// Model tạm để populate('tutorId') chạy được.
// Khi Người A có model User chính thức (cùng collection `users`) thì thay file này.
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    rating: { type: Number, default: 5 },
    hourlyRate: { type: Number, default: 0 },
    subjectsTaught: { type: [String], default: [] },
    role: { type: String, default: 'tutor' },
  },
  { timestamps: true }
)

const User = mongoose.models.User || mongoose.model('User', userSchema)
export default User
