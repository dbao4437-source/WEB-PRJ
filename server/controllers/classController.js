import Class from '../models/Class.js'

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
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
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
    // Nếu có auth middleware từ Người A, tutorId có thể lấy từ req.user._id
    const tutorId = req.user ? req.user._id : req.body.tutorId

    const newClass = await Class.create({
      ...req.body,
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
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
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
