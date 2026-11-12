import { initialClasses } from '../data/initialClasses'

const STORAGE_KEY = 'hsa_education_classes'

// Khởi tạo dữ liệu vào localStorage nếu chưa có
const loadAllClasses = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialClasses))
      return initialClasses
    }
    return JSON.parse(data)
  } catch (error) {
    console.error('Lỗi đọc dữ liệu lớp học:', error)
    return initialClasses
  }
}

const saveAllClasses = (classes) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes))
  } catch (error) {
    console.error('Lỗi lưu dữ liệu lớp học:', error)
  }
}

/**
 * Service quản lý Lớp học chuẩn theo nghiệp vụ Người B
 * (Mô phỏng chính xác REST API: GET, POST, PUT, DELETE /api/classes)
 */
export const classService = {
  // GET /api/classes kèm tìm kiếm, lọc theo môn/giá/khối, phân trang (page / limit)
  async getClasses({
    keyword = '',
    subject = '',
    gradeLevel = '',
    priceRange = 'all',
    status = '',
    sortBy = 'newest',
    page = 1,
    limit = 6,
  } = {}) {
    let list = loadAllClasses()

    // 1. Tìm kiếm theo từ khóa (tiêu đề, môn học, tên gia sư)
    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim()
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.subject?.toLowerCase().includes(q) ||
          c.tutorId?.fullName?.toLowerCase().includes(q)
      )
    }

    // 2. Lọc theo môn học
    if (subject && subject !== 'Tất cả' && subject !== 'Tất cả lớp học') {
      list = list.filter((c) => c.subject === subject)
    }

    // 3. Lọc theo khối lớp (gradeLevel)
    if (gradeLevel && gradeLevel !== 'Tất cả') {
      list = list.filter((c) => c.gradeLevel === gradeLevel)
    }

    // 4. Lọc theo khoảng giá học phí (fee)
    if (priceRange === 'under-1m') {
      list = list.filter((c) => c.fee < 1000000)
    } else if (priceRange === '1m-1.5m') {
      list = list.filter((c) => c.fee >= 1000000 && c.fee <= 1500000)
    } else if (priceRange === 'above-1.5m') {
      list = list.filter((c) => c.fee > 1500000)
    }

    // 5. Lọc theo trạng thái lớp
    if (status && status !== 'all') {
      list = list.filter((c) => c.status === status)
    }

    // 6. Sắp xếp (Sort)
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.fee - b.fee)
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.fee - a.fee)
    } else if (sortBy === 'students') {
      list.sort((a, b) => b.currentStudents - a.currentStudents)
    } else {
      // newest
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    }

    // 7. Phân trang (Pagination)
    const totalItems = list.length
    const totalPages = Math.ceil(totalItems / limit) || 1
    const currentPage = Math.min(Math.max(1, Number(page)), totalPages)
    const startIndex = (currentPage - 1) * limit
    const paginatedItems = list.slice(startIndex, startIndex + limit)

    return {
      classes: paginatedItems,
      pagination: {
        page: currentPage,
        limit,
        totalItems,
        totalPages,
      },
    }
  },

  // GET /api/classes/:id (populate tutorId)
  async getClassById(id) {
    const list = loadAllClasses()
    const found = list.find((c) => c._id === id || c.id === Number(id))
    if (!found) {
      throw new Error('Không tìm thấy lớp học với mã này')
    }
    return found
  },

  // POST /api/classes (tạo lớp học mới)
  async createClass(newClass) {
    const list = loadAllClasses()
    const created = {
      ...newClass,
      _id: `class-${Date.now()}`,
      currentStudents: Number(newClass.currentStudents) || 0,
      maxStudents: Number(newClass.maxStudents) || 20,
      fee: Number(newClass.fee) || 1000000,
      status: newClass.status || 'open',
      createdAt: new Date().toISOString(),
      tutorId: newClass.tutorId || {
        _id: 'tutor-current',
        fullName: newClass.tutorName || 'Gia sư HSA',
        email: 'tutor@hsa.edu.vn',
        phone: '0900 123 456',
        rating: 5.0,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
        bio: 'Giảng viên chuyên môn nhiệt tình, tận tâm với học viên.',
      },
    }
    list.unshift(created)
    saveAllClasses(list)
    return created
  },

  // PUT /api/classes/:id (sửa thông tin, sĩ số, lịch học)
  async updateClass(id, updatedFields) {
    const list = loadAllClasses()
    const index = list.findIndex((c) => c._id === id || c.id === Number(id))
    if (index === -1) {
      throw new Error('Không tìm thấy lớp học để cập nhật')
    }
    const updated = {
      ...list[index],
      ...updatedFields,
      fee: Number(updatedFields.fee ?? list[index].fee),
      maxStudents: Number(updatedFields.maxStudents ?? list[index].maxStudents),
      currentStudents: Number(updatedFields.currentStudents ?? list[index].currentStudents),
      updatedAt: new Date().toISOString(),
    }
    list[index] = updated
    saveAllClasses(list)
    return updated
  },

  // DELETE /api/classes/:id (hủy / xóa lớp học)
  async deleteClass(id) {
    const list = loadAllClasses()
    const index = list.findIndex((c) => c._id === id || c.id === Number(id))
    if (index === -1) {
      throw new Error('Không tìm thấy lớp học để xóa')
    }
    const removed = list.splice(index, 1)[0]
    saveAllClasses(list)
    return removed
  },

  // Khôi phục dữ liệu ban đầu
  async resetToDefault() {
    saveAllClasses(initialClasses)
    return initialClasses
  },
}
