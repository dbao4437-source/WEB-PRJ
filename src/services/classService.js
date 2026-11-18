const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const CLASSES_URL = `${API_URL}/classes`

// Gọi API và trả về JSON; ném lỗi kèm message của server nếu không thành công
const request = async (url, options = {}) => {
  let res
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new Error('Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy (npm run dev trong thư mục server).')
  }

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json.message || `Lỗi máy chủ (${res.status})`)
  }
  return json
}

// Đổi khoảng giá của giao diện thành minFee / maxFee của API
const priceRangeToParams = (priceRange) => {
  if (priceRange === 'under-1m') return { maxFee: 999999 }
  if (priceRange === '1m-1.5m') return { minFee: 1000000, maxFee: 1500000 }
  if (priceRange === 'above-1.5m') return { minFee: 1500001 }
  return {}
}

// Chuẩn hóa dữ liệu gửi lên: tutorId chỉ là ObjectId hoặc bỏ đi, tên gia sư gửi qua tutorName
const toPayload = (fields) => {
  const { tutorId, ...rest } = fields
  const payload = { ...rest }
  delete payload['tutorId.fullName']

  if (typeof tutorId === 'string') {
    payload.tutorId = tutorId
  } else if (tutorId && tutorId.fullName && !payload.tutorName) {
    payload.tutorName = tutorId.fullName
  }

  if (payload.fee !== undefined) payload.fee = Number(payload.fee)
  if (payload.maxStudents !== undefined) payload.maxStudents = Number(payload.maxStudents)
  if (payload.currentStudents !== undefined) payload.currentStudents = Number(payload.currentStudents)
  return payload
}

/**
 * Service Lớp học - gọi REST API /api/classes của backend Express + MongoDB
 */
export const classService = {
  // GET /api/classes?search&subject&gradeLevel&minFee&maxFee&status&sortBy&page&limit
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
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('search', keyword.trim())
    if (subject && subject !== 'Tất cả' && subject !== 'Tất cả lớp học') params.set('subject', subject)
    if (gradeLevel && gradeLevel !== 'Tất cả') params.set('gradeLevel', gradeLevel)
    if (status && status !== 'all') params.set('status', status)
    Object.entries(priceRangeToParams(priceRange)).forEach(([key, value]) => params.set(key, value))
    params.set('sortBy', sortBy)
    params.set('page', page)
    params.set('limit', limit)

    const json = await request(`${CLASSES_URL}?${params.toString()}`)
    return { classes: json.data, pagination: json.pagination }
  },

  // GET /api/classes/:id (đã populate tutorId)
  async getClassById(id) {
    const json = await request(`${CLASSES_URL}/${id}`)
    return json.data
  },

  // POST /api/classes
  async createClass(newClass) {
    const json = await request(CLASSES_URL, {
      method: 'POST',
      body: JSON.stringify(toPayload(newClass)),
    })
    return json.data
  },

  // PUT /api/classes/:id
  async updateClass(id, updatedFields) {
    const json = await request(`${CLASSES_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toPayload(updatedFields)),
    })
    return json.data
  },

  // DELETE /api/classes/:id
  async deleteClass(id) {
    const json = await request(`${CLASSES_URL}/${id}`, { method: 'DELETE' })
    return json.data
  },

  // GET /api/classes/stats/subjects — số lớp theo môn (server aggregate)
  async getSubjectCounts() {
    const json = await request(`${CLASSES_URL}/stats/subjects`)
    return json.data
  },

  // GET /api/classes/stats/overview — tổng lớp / lớp đang mở / tổng học viên
  async getOverviewStats() {
    const json = await request(`${CLASSES_URL}/stats/overview`)
    return json.data
  },

  // Khôi phục dữ liệu demo: server xóa hết lớp hiện có và nạp lại bộ lớp mẫu trong một lượt
  async resetToDefault() {
    const json = await request(`${CLASSES_URL}/reset-demo`, { method: 'POST' })
    return json.data
  },
}
