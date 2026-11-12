import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  BookOpen,
  Users,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react'
import { classService } from '../services/classService'

const initialFormState = {
  title: '',
  subject: 'Toán THPT',
  gradeLevel: 'Lớp 12',
  tutorName: 'Thầy Kevin Nguyễn',
  fee: 1200000,
  schedule: 'Thứ 2, 4, 6 · 19:00 - 20:30',
  maxStudents: 20,
  currentStudents: 0,
  status: 'open',
  description: '',
}

export default function ClassManagementPage() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [currentEditId, setCurrentEditId] = useState(null)
  const [formData, setFormData] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})
  const [toastMessage, setToastMessage] = useState(null)

  // Load danh sách lớp
  const fetchClasses = async () => {
    setLoading(true)
    try {
      const res = await classService.getClasses({ limit: 100 })
      setClasses(res.classes)
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu quản lý:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Mở modal Thêm mới
  const handleOpenCreateModal = () => {
    setModalMode('create')
    setFormData(initialFormState)
    setFormErrors({})
    setIsModalOpen(true)
  }

  // Mở modal Chỉnh sửa
  const handleOpenEditModal = (course) => {
    setModalMode('edit')
    setCurrentEditId(course._id || course.id)
    setFormData({
      title: course.title || '',
      subject: course.subject || 'Toán THPT',
      gradeLevel: course.gradeLevel || 'Lớp 12',
      tutorName: course.tutorId?.fullName || 'Gia sư HSA',
      fee: course.fee || 1000000,
      schedule: course.schedule || '',
      maxStudents: course.maxStudents || 20,
      currentStudents: course.currentStudents || 0,
      status: course.status || 'open',
      description: course.description || '',
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  // Validate form
  const validateForm = () => {
    const errors = {}
    if (!formData.title.trim()) errors.title = 'Vui lòng nhập tên lớp học'
    if (!formData.schedule.trim()) errors.schedule = 'Vui lòng nhập lịch học'
    if (Number(formData.fee) <= 0) errors.fee = 'Học phí phải lớn hơn 0'
    if (Number(formData.maxStudents) < 1) errors.maxStudents = 'Sĩ số tối đa tối thiểu là 1'
    if (Number(formData.currentStudents) > Number(formData.maxStudents)) {
      errors.currentStudents = 'Sĩ số hiện tại không được vượt quá sĩ số tối đa'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Xử lý Lưu (Tạo mới hoặc Cập nhật)
  const handleSubmitForm = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      if (modalMode === 'create') {
        await classService.createClass({
          ...formData,
          tutorId: {
            fullName: formData.tutorName,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
            email: 'giasu@hsa.edu.vn',
            phone: '0988 999 888',
            rating: 5.0,
            bio: 'Gia sư nhiệt tình giàu kinh nghiệm tại HSA Education.',
          },
        })
        showToast('✓ Đã tạo lớp học mới thành công!')
      } else {
        await classService.updateClass(currentEditId, {
          ...formData,
          'tutorId.fullName': formData.tutorName,
        })
        showToast('✓ Cập nhật thông tin lớp học thành công!')
      }
      setIsModalOpen(false)
      fetchClasses()
    } catch (err) {
      alert('Có lỗi xảy ra: ' + err.message)
    }
  }

  // Xử lý Xóa lớp học
  const handleDeleteClass = async (course) => {
    const isConfirm = window.confirm(
      `Bạn có chắc chắn muốn xóa lớp: "${course.title}"?\nHành động này không thể hoàn tác!`
    )
    if (!isConfirm) return

    try {
      await classService.deleteClass(course._id || course.id)
      showToast('✓ Đã xóa lớp học thành công!')
      fetchClasses()
    } catch (err) {
      alert('Không thể xóa lớp học: ' + err.message)
    }
  }

  // Khôi phục dữ liệu demo
  const handleResetDemoData = async () => {
    if (window.confirm('Khôi phục lại danh sách lớp học mẫu ban đầu?')) {
      await classService.resetToDefault()
      showToast('✓ Đã khôi phục dữ liệu ban đầu!')
      fetchClasses()
    }
  }

  // Lọc hiển thị trong bảng
  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tutorId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSubject =
      selectedSubject === 'all' || c.subject === selectedSubject

    return matchesSearch && matchesSubject
  })

  // Thống kê nhanh
  const totalStudents = classes.reduce((sum, c) => sum + (c.currentStudents || 0), 0)
  const openClassesCount = classes.filter((c) => c.status === 'open').length

  return (
    <div className="manage-page-layout">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      {/* Header trang Quản lý */}
      <div className="manage-header">
        <div>
          <div className="eyebrow">HSA EDUCATION · MÀN HÌNH 4 (QUẢN LÝ LỚP)</div>
          <h1>Bảng Quản trị & Điều phối Lớp học</h1>
          <p className="course-subtitle">
            Dành cho Gia sư & Quản trị viên (Admin) thực hiện các thao tác Thêm, Sửa, Xóa và theo dõi sĩ số lớp học.
          </p>
        </div>

        <div className="manage-top-actions">
          <button className="create-class-btn" onClick={handleOpenCreateModal}>
            <Plus size={18} /> Thêm lớp học mới
          </button>
          <button className="reset-demo-btn" onClick={handleResetDemoData} title="Khôi phục dữ liệu mẫu ban đầu">
            <RotateCcw size={16} /> Dữ liệu mẫu
          </button>
        </div>
      </div>

      {/* 4 Thẻ Thống Kê Tổng Quan */}
      <div className="stats-grid-row">
        <div className="stat-summary-card">
          <div className="stat-card-icon" style={{ background: '#eaf6ef', color: '#078f65' }}>
            <Layers size={22} />
          </div>
          <div>
            <div className="stat-card-label">Tổng số lớp học</div>
            <div className="stat-card-value">{classes.length}</div>
          </div>
        </div>

        <div className="stat-summary-card">
          <div className="stat-card-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div className="stat-card-label">Lớp đang mở tuyển</div>
            <div className="stat-card-value">{openClassesCount}</div>
          </div>
        </div>

        <div className="stat-summary-card">
          <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Users size={22} />
          </div>
          <div>
            <div className="stat-card-label">Tổng học viên đăng ký</div>
            <div className="stat-card-value">{totalStudents}</div>
          </div>
        </div>

        <div className="stat-summary-card">
          <div className="stat-card-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div className="stat-card-label">Quyền hiện tại</div>
            <div className="stat-card-value" style={{ fontSize: '18px' }}>Gia sư / Admin</div>
          </div>
        </div>
      </div>

      {/* Thanh tìm kiếm & Lọc trong Bảng Quản trị */}
      <div className="manage-filter-bar">
        <div className="manage-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên lớp, môn học, tên gia sư..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="manage-select"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="all">Tất cả môn học</option>
          <option value="Toán THPT">Toán THPT</option>
          <option value="Tiếng Trung">Tiếng Trung</option>
          <option value="Vật Lý nâng cao">Vật Lý nâng cao</option>
          <option value="Hóa học">Hóa học</option>
          <option value="Tiếng Anh">Tiếng Anh</option>
        </select>

        <span className="manage-count-badge">
          Tìm thấy <strong>{filteredClasses.length}</strong> lớp
        </span>
      </div>

      {/* Bảng Dữ liệu Quản lý Lớp học */}
      <div className="manage-table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải dữ liệu...</div>
        ) : filteredClasses.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#777' }}>
            Không tìm thấy lớp học nào khớp với điều kiện tìm kiếm.
          </div>
        ) : (
          <table className="manage-table">
            <thead>
              <tr>
                <th>Lớp học & Khối lớp</th>
                <th>Gia sư phụ trách</th>
                <th>Học phí</th>
                <th>Lịch học</th>
                <th>Sĩ số</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((course) => {
                const tutor = course.tutorId || {}
                const isFull = course.currentStudents >= course.maxStudents

                return (
                  <tr key={course._id || course.id}>
                    <td>
                      <div className="table-class-title">{course.title}</div>
                      <div className="table-class-meta">
                        <span className="table-subject-tag">{course.subject}</span>
                        <span className="table-grade-tag">{course.gradeLevel}</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-tutor-cell">
                        <img
                          src={tutor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={tutor.fullName}
                          className="table-tutor-avatar"
                        />
                        <span>{tutor.fullName || 'Gia sư HSA'}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{Number(course.fee).toLocaleString('vi-VN')}đ</strong>
                    </td>
                    <td>
                      <div className="table-schedule-cell">
                        <Calendar size={13} style={{ marginRight: '4px' }} />
                        {course.schedule}
                      </div>
                    </td>
                    <td>
                      <div className="table-students-cell">
                        <span>{course.currentStudents} / {course.maxStudents}</span>
                        <div className="table-progress">
                          <div
                            className="table-progress-fill"
                            style={{
                              width: `${Math.min(100, (course.currentStudents / course.maxStudents) * 100)}%`,
                              background: isFull ? '#e53e3e' : '#07996e',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${course.status === 'open' ? 'open' : 'full'}`}>
                        {course.status === 'open' ? 'Đang mở' : 'Đã đủ / Đóng'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link
                          to={`/classes/${course._id || course.id}`}
                          className="action-btn view-action"
                          title="Xem chi tiết lớp"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          className="action-btn edit-action"
                          onClick={() => handleOpenEditModal(course)}
                          title="Sửa thông tin lớp"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="action-btn delete-action"
                          onClick={() => handleDeleteClass(course)}
                          title="Xóa lớp học"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Thêm / Sửa Lớp Học */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalMode === 'create' ? 'Thêm Lớp Học Mới' : 'Cập Nhật Lớp Học'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmitForm} className="modal-form">
              <div className="form-grid-2">
                <div className="form-group span-2">
                  <label>Tên lớp học *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Luyện thi Toán THPT Chinh phục điểm 9+"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  {formErrors.title && <span className="error-text">{formErrors.title}</span>}
                </div>

                <div className="form-group">
                  <label>Môn học *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="Toán THPT">Toán THPT</option>
                    <option value="Tiếng Trung">Tiếng Trung</option>
                    <option value="Vật Lý nâng cao">Vật Lý nâng cao</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Khối lớp *</label>
                  <select
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                  >
                    <option value="Lớp 10">Lớp 10</option>
                    <option value="Lớp 11">Lớp 11</option>
                    <option value="Lớp 12">Lớp 12</option>
                    <option value="Giao tiếp & Chứng chỉ">Giao tiếp & Chứng chỉ</option>
                    <option value="Luyện thi chứng chỉ">Luyện thi chứng chỉ</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Gia sư phụ trách *</label>
                  <input
                    type="text"
                    required
                    placeholder="Thầy Kevin Nguyễn"
                    value={formData.tutorName}
                    onChange={(e) => setFormData({ ...formData, tutorName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Học phí trọn khóa (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    step="50000"
                    placeholder="1500000"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                  />
                  {formErrors.fee && <span className="error-text">{formErrors.fee}</span>}
                </div>

                <div className="form-group span-2">
                  <label>Khung giờ & Lịch học *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Thứ 2, 4, 6 · 19:30 - 21:00"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  />
                  {formErrors.schedule && <span className="error-text">{formErrors.schedule}</span>}
                </div>

                <div className="form-group">
                  <label>Sĩ số tối đa *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Sĩ số hiện tại</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentStudents}
                    onChange={(e) => setFormData({ ...formData, currentStudents: Number(e.target.value) })}
                  />
                  {formErrors.currentStudents && <span className="error-text">{formErrors.currentStudents}</span>}
                </div>

                <div className="form-group span-2">
                  <label>Trạng thái lớp học</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="open">Đang mở nhận học viên (Open)</option>
                    <option value="full">Đã đủ học viên (Full)</option>
                    <option value="closed">Tạm đóng lớp (Closed)</option>
                  </select>
                </div>

                <div className="form-group span-2">
                  <label>Mô tả chi tiết khóa học</label>
                  <textarea
                    rows={4}
                    placeholder="Nội dung kiến thức trọng tâm, phương pháp giảng dạy, cam kết đầu ra..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="submit-btn">
                  {modalMode === 'create' ? 'Tạo lớp học' : 'Lưu cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
