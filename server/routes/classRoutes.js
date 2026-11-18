import express from 'express'
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  resetDemoClasses,
  getSubjectCounts,
  getOverviewStats,
} from '../controllers/classController.js'

const router = express.Router()

// Route danh sách & tạo mới
router.route('/').get(getClasses).post(createClass)

// Route thống kê & khôi phục dữ liệu demo
// Phải khai báo trước '/:id' để Express không hiểu "stats" là ObjectId
router.get('/stats/subjects', getSubjectCounts)
router.get('/stats/overview', getOverviewStats)
router.post('/reset-demo', resetDemoClasses)

// Route chi tiết, cập nhật & xóa
router.route('/:id').get(getClassById).put(updateClass).delete(deleteClass)

export default router
