import mongoose from 'mongoose'

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI?.trim()
  if (!uri) {
    console.warn('MONGODB_URI đang để trống. API dữ liệu sẽ trả 503 cho đến khi bạn thêm URI MongoDB Atlas vào server/.env.')
    return false
  }
  try {
    await mongoose.connect(uri)
    console.log(`Đã kết nối MongoDB: ${mongoose.connection.name}`)
    return true
  } catch (error) {
    console.error('Không kết nối được MongoDB:', error.message)
    return false
  }
}

export function requireDatabase(_req, res, next) {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'MongoDB chưa kết nối. Hãy điền MONGODB_URI trong server/.env rồi khởi động lại backend.' })
  next()
}
