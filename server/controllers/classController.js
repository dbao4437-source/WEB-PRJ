import Class from '../models/Class.js'
import User from '../models/User.js'
import { initialClasses } from '../../src/data/initialClasses.js'

const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const isObjectIdString = (value) => typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value)

// Xác định gia sư phụ trách: ưu tiên req.user (khi có auth của Người A),
// rồi tutorId hợp lệ trong body, cuối cùng tìm/tạo gia sư theo tutorName.
const resolveTutorId = async (req, { fromAuth = false } = {}) => {
  if (fromAuth && req.user && req.user._id) return req.user._id
  if (isObjectIdString(req.body.tutorId)) return req.body.tutorId
  const name = (req.body.tutorName || '').trim()
  if (!name) return undefined
  let tutor = await User.findOne({ fullName: name })
  if (!tutor) tutor = await User.create({ fullName: name })
  return tutor._id
}

/**
 * Controller Quản lý Lớp học - Phụ trách: Người B
 * Đúng chuẩn REST API theo yêu cầu Đề tài BTL PTIT
 */

// 1. GET /api/classes
// Lấy danh sách lớp kèm tìm kiếm, lọc theo môn/giá/khối lớp, phân trang page/limit
export const getClasses = async (req, res, next) => {
  try {
    const {
      search,
      subject,
      gradeLevel,
      minFee,
      maxFee,
      status,
      sortBy = 'newest',
      page = 1,
      limit = 6,
    } = req.query

    // Xây dựng query filter
    const query = {}

    // Tìm kiếm từ khóa (theo title hoặc subject)
    if (search) {
      query.$or = [
        { title: { $regex: escapeRegex(search), $options: 'i' } },
        { subject: { $regex: escapeRegex(search), $options: 'i' } },
        { description: { $regex: escapeRegex(search), $options: 'i' } },
      ]
    }

    // Lọc theo môn học
    if (subject && subject !== 'Tất cả' && subject !== 'Tất cả lớp học') {
      query.subject = subject
    }

    // Lọc theo khối lớp
    if (gradeLevel && gradeLevel !== 'Tất cả') {
      query.gradeLevel = gradeLevel
    }

    // Lọc theo trạng thái
    if (status && status !== 'all') {
      query.status = status
    }

    // Lọc theo khoảng học phí
    if (minFee || maxFee) {
      query.fee = {}
      if (minFee) query.fee.$gte = Number(minFee)
      if (maxFee) query.fee.$lte = Number(maxFee)
    }

    // Xác định thứ tự sắp xếp
    let sortOptions = { createdAt: -1 }
    if (sortBy === 'price-asc') sortOptions = { fee: 1 }
    if (sortBy === 'price-desc') sortOptions = { fee: -1 }
    if (sortBy === 'students') sortOptions = { currentStudents: -1 }

    // Phân trang
    const currentPage = Math.max(1, parseInt(page, 10) || 1)
    const pageSize = Math.max(1, parseInt(limit, 10) || 6)
    const skip = (currentPage - 1) * pageSize

    const totalItems = await Class.countDocuments(query)
    const classes = await Class.find(query)
      .populate('tutorId', 'fullName email phone avatar bio rating')
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize)

    return res.status(200).json({
      success: true,
      count: classes.length,
      pagination: {
        page: currentPage,
        limit: pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize) || 1,
      },
      data: classes,
    })
  } catch (error) {
    next(error)
  }
}

// 2. GET /api/classes/:id
// Lấy chi tiết lớp học & populate thông tin gia sư (tutorId)
export const getClassById = async (req, res, next) => {
  try {
    const classItem = await Class.findById(req.params.id).populate(
      'tutorId',
      'fullName email phone avatar bio rating subjectsTaught hourlyRate'
    )

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học với mã này',
      })
    }

    return res.status(200).json({
      success: true,
      data: classItem,
    })
  } catch (error) {
    next(error)
  }
}

// 3. POST /api/classes
// Tạo lớp học mới (Gia sư/Admin)
export const createClass = async (req, res, next) => {
  try {
    const tutorId = await resolveTutorId(req, { fromAuth: true })

    // tutorName chỉ dùng để tra cứu tutorId, không lưu trực tiếp vào Class
    const payload = { ...req.body }
    delete payload.tutorName

    const newClass = await Class.create({
      ...payload,
      tutorId,
    })

    const populatedClass = await newClass.populate(
      'tutorId',
      'fullName email phone avatar bio'
    )

    return res.status(201).json({
      success: true,
      message: 'Tạo lớp học mới thành công',
      data: populatedClass,
    })
  } catch (error) {
    next(error)
  }
}

// 4. PUT /api/classes/:id
// Sửa thông tin, sĩ số, lịch học
export const updateClass = async (req, res, next) => {
  try {
    const update = { ...req.body }
    delete update.tutorName
    delete update.tutorId

    const tutorId = await resolveTutorId(req)
    if (tutorId) update.tutorId = tutorId

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).populate('tutorId', 'fullName email phone avatar bio')

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học để cập nhật',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật lớp học thành công',
      data: updatedClass,
    })
  } catch (error) {
    next(error)
  }
}

// 5. DELETE /api/classes/:id
// Hủy / Xóa lớp học
export const deleteClass = async (req, res, next) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id)

    if (!deletedClass) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học để xóa',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Đã xóa lớp học thành công',
      data: { id: req.params.id },
    })
  } catch (error) {
    next(error)
  }
}

// 6. GET /api/classes/stats/subjects
// Đếm số lớp theo từng môn (dùng aggregate để không bị giới hạn page/limit)
export const getSubjectCounts = async (req, res, next) => {
  try {
    const rows = await Class.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
    ])

    const bySubject = {}
    let total = 0
    for (const row of rows) {
      if (!row._id) continue
      bySubject[row._id] = row.count
      total += row.count
    }

    return res.status(200).json({ success: true, data: { total, bySubject } })
  } catch (error) {
    next(error)
  }
}

// 7. GET /api/classes/stats/overview
// Thống kê tổng quan cho bảng quản trị: tổng lớp, số lớp đang mở, tổng học viên
export const getOverviewStats = async (req, res, next) => {
  try {
    const [totalClasses, openClasses, aggregate] = await Promise.all([
      Class.countDocuments({}),
      Class.countDocuments({ status: 'open' }),
      Class.aggregate([{ $group: { _id: null, totalStudents: { $sum: '$currentStudents' } } }]),
    ])

    return res.status(200).json({
      success: true,
      data: {
        totalClasses,
        openClasses,
        totalStudents: aggregate[0]?.totalStudents || 0,
      },
    })
  } catch (error) {
    next(error)
  }
}

// 8. POST /api/classes/reset-demo// Khôi phục dữ liệu demo: xóa toàn bộ lớp hiện có rồi nạp lại bộ lớp mẫu.
// Chạy ở server để dùng insertMany (một lượt) thay vì N request DELETE tuần tự từ client.
export const resetDemoClasses = async (req, res, next) => {
  try {
    // Upsert gia sư theo email để chạy nhiều lần không bị trùng
    const tutorIds = new Map()
    for (const sample of initialClasses) {
      const tutor = sample.tutorId
      if (tutorIds.has(tutor._id)) continue
      const { _id, ...tutorFields } = tutor
      const saved = await User.findOneAndUpdate({ email: tutorFields.email }, tutorFields, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      })
      tutorIds.set(_id, saved._id)
    }

    await Class.deleteMany({})
    const docs = initialClasses.map(({ _id, tutorId, ...rest }) => ({
      ...rest,
      tutorId: tutorIds.get(tutorId._id),
    }))
    await Class.insertMany(docs)

    const classes = await Class.find({})
      .populate('tutorId', 'fullName email phone avatar bio rating')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      message: `Đã khôi phục ${docs.length} lớp học mẫu`,
      count: docs.length,
      data: classes,
    })
  } catch (error) {
    next(error)
  }
}
