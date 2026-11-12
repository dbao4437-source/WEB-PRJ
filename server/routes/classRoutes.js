import express from 'express'
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} from '../controllers/classController.js'

const router = express.Router()

// Route danh sách & tạo mới
router.route('/').get(getClasses).post(createClass)

// Route chi tiết, cập nhật & xóa
router.route('/:id').get(getClassById).put(updateClass).delete(deleteClass)

export default router
