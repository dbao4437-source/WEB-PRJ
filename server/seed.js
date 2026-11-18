import 'dotenv/config'
import mongoose from 'mongoose'
import User from './models/User.js'
import Class from './models/Class.js'
import { initialClasses } from '../src/data/initialClasses.js'

// Chạy: npm run seed
// Nạp gia sư (collection users) và các lớp mẫu (collection classes) vào MongoDB.
// Lưu ý: xóa toàn bộ lớp cũ trong collection classes trước khi nạp.
const run = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tutor_management'
  await mongoose.connect(uri)
  console.log('✓ Đã kết nối:', mongoose.connection.name)

  // 1. Gia sư: upsert theo email để chạy seed nhiều lần không bị trùng
  const tutorIds = new Map()
  for (const c of initialClasses) {
    const tutor = c.tutorId
    if (tutorIds.has(tutor._id)) continue
    const { _id, ...fields } = tutor
    const saved = await User.findOneAndUpdate({ email: fields.email }, fields, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    })
    tutorIds.set(_id, saved._id)
  }

  // 2. Lớp học: thay tutorId (object lồng) bằng ObjectId thật
  await Class.deleteMany({})
  const docs = initialClasses.map(({ _id, tutorId, ...rest }) => ({
    ...rest,
    tutorId: tutorIds.get(tutorId._id),
  }))
  await Class.insertMany(docs)

  console.log(`✓ Đã nạp ${tutorIds.size} gia sư và ${docs.length} lớp học`)
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error('✗ Seed thất bại:', err.message)
  process.exit(1)
})
