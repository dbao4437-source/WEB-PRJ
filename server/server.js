import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import classRoutes from './routes/classRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tutor_management'

// Middlewares
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'HSA Tutor API is running!' })
})

// Routes nghiệp vụ Người B
app.use('/api/classes', classRoutes)

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Đường dẫn không tồn tại: ${req.originalUrl}`,
  })
})

// Centralized Error Handling Middleware (Yêu cầu ảnh 4)
app.use((err, req, res, next) => {
  console.error('Server Error:', err)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  })
})

// Kết nối MongoDB và Khởi động Server
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✓ Kết nối MongoDB thành công!')
    app.listen(PORT, () => {
      console.log(`✓ Server đang chạy tại http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('✗ Kết nối MongoDB thất bại:', error.message)
    // Server vẫn chạy để phục vụ API test
    app.listen(PORT, () => {
      console.log(`! Server đang chạy ở chế độ offline tại http://localhost:${PORT}`)
    })
  }
}

startServer()
