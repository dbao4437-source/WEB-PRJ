import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import authRoutes from './routes/authRoutes.js'
import tutorRoutes from './routes/tutors.js'
import adminTutorRoutes from './routes/adminTutorRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import userRoutes from './routes/users.js'
import { connectDatabase } from './config/database.js'

const app = express()
const allowedOrigins = process.env.CLIENT_ORIGIN?.split(',').map(value => value.trim()).filter(Boolean)
app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : true }))
app.use(express.json({ limit: '1mb' }))
app.use('/uploads', express.static(fileURLToPath(new URL('./uploads/', import.meta.url))))
app.get('/api/health', (_req, res) => res.json({ success: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }))
app.use('/api/auth', authRoutes)
app.use('/api/tutors', tutorRoutes)
app.use('/api/admin/tutors', adminTutorRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/users', userRoutes)
app.use((_req, res) => res.status(404).json({ message: 'Không tìm thấy API.' }))
app.use((error, _req, res, _next) => {
  console.error(error)
  if (error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Ảnh vượt quá giới hạn 2MB.' })
  if (error.status) return res.status(error.status).json({ message: error.message })
  if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ message: error.message })
  if (error.code === 11000) return res.status(409).json({ message: 'Giá trị đã tồn tại.' })
  return res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' })
})

const port = Number(process.env.PORT || 5000)
await connectDatabase()
app.listen(port, () => console.log(`TutorCenter API đang chạy tại http://localhost:${port}`))
