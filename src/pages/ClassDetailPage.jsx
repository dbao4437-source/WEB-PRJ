import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Star,
  CheckCircle,
  Share2,
  Mail,
  Phone,
  ShieldCheck,
  BookOpen,
  Award,
  AlertCircle,
  Download,
  Play,
  Volume2,
  Maximize2,
  Check,
  Sparkles,
  Radio,
  FileCheck2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { classService } from '../services/classService'

export default function ClassDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [enrollSuccess, setEnrollSuccess] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeStage, setActiveStage] = useState(2)

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)
      try {
        const data = await classService.getClassById(id)
        setCourse(data)
      } catch (err) {
        setError(err.message || 'Lớp học không tồn tại')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  if (loading) {
    return (
      <div className="pitch-loading-state">
        <div className="spinner"></div>
        <p>Đang tải thông tin lớp học...</p>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="pitch-error-state">
        <AlertCircle size={48} color="#e53e3e" style={{ margin: '0 auto 16px' }} />
        <h2>Không tìm thấy lớp học</h2>
        <p>{error || 'Mã lớp không hợp lệ hoặc đã bị xóa.'}</p>
        <Link to="/" className="pitch-orange-btn" style={{ display: 'inline-flex', marginTop: '16px' }}>
          Quay lại danh sách lớp
        </Link>
      </div>
    )
  }

  const tutor = course.tutorId || {}
  const isFull = course.currentStudents >= course.maxStudents || course.status === 'full'

  const handleEnrollSubmit = (e) => {
    e.preventDefault()
    setEnrollSuccess(true)
    if (course.currentStudents < course.maxStudents) {
      classService.updateClass(course._id || course.id, {
        currentStudents: course.currentStudents + 1,
      }).then((updated) => setCourse(updated))
    }
  }

  return (
    <div className="pitch-detail-container">
      {/* 4 Khối chia lưới chuẩn theo layout PitchPlay */}
      <div className="pitch-dashboard-grid">

        {/* Khối 1 (Trên - Trái): Tổng quan lớp học & Thông số */}
        <div className="pitch-card course-overview-card">
          <div className="overview-header">
            <span className="overview-tag-badge">{course.subject}</span>
            <span className="overview-grade-badge">{course.gradeLevel}</span>
          </div>

          <h1 className="overview-title">{course.title}</h1>

          <div className="overview-author-line">
            <span>Khóa học phụ trách bởi </span>
            <strong className="author-link">{tutor.fullName || 'Thầy Kevin Nguyễn'}</strong>
            <span className="author-rating">
              <Star size={14} fill="#f59e0b" color="#f59e0b" style={{ verticalAlign: 'middle' }} />{' '}
              {tutor.rating || '5.0'}
            </span>
          </div>

          <p className="overview-description">
            {course.description ||
              'Nâng cao năng lực giải toán và rèn luyện kỹ năng thực chiến cùng gia sư thông qua các chuyên đề phân loại và phương pháp giải nhanh độc quyền.'}
          </p>

          {/* 3 Pills tiêu chuẩn như Tone, Accuracy, Speed */}
          <div className="overview-pills-row">
            <span className="pitch-pill pill-tone">Tư duy logic</span>
            <span className="pitch-pill pill-accuracy">Giải nhanh Casio</span>
            <span className="pitch-pill pill-speed">Mục tiêu 9+</span>
          </div>

          {/* Bảng thông số thuộc tính lớp */}
          <div className="overview-specs-table">
            <div className="spec-item">
              <span className="spec-title">Hình thức học</span>
              <strong className="spec-val">Trực tiếp & Online</strong>
            </div>
            <div className="spec-item">
              <span className="spec-title">Khối lớp</span>
              <strong className="spec-val">{course.gradeLevel}</strong>
            </div>
            <div className="spec-item">
              <span className="spec-title">Lịch học tuần</span>
              <strong className="spec-val">{course.schedule}</strong>
            </div>
            <div className="spec-item">
              <span className="spec-title">Sĩ số lớp</span>
              <strong className="spec-val">
                {course.currentStudents}/{course.maxStudents} học viên ({isFull ? 'Đã đủ' : 'Đang mở'})
              </strong>
            </div>
            <div className="spec-item highlight-fee">
              <span className="spec-title">Học phí trọn khóa</span>
              <strong className="spec-val fee-number">
                {Number(course.fee).toLocaleString('vi-VN')}đ
              </strong>
            </div>
          </div>
        </div>

        {/* Khối 2 (Trên - Phải): Trình chiếu Video / Bài giảng mẫu */}
        <div className="pitch-card video-player-card">
          <div className="player-top-bar">
            <div className="player-lesson-info">
              <span className="lesson-badge">Giai đoạn 2 · Buổi 3</span>
              <span className="lesson-title">Phương pháp giải nhanh Casio & Tích phân vận dụng cao</span>
            </div>
            <button
              type="button"
              className="download-material-btn"
              onClick={() => alert('Đang tải giáo trình PDF độc quyền của gia sư...')}
            >
              <Download size={15} />
              <span>Tài liệu</span>
            </button>
          </div>

          <div className="video-viewport">
            <img
              src={course.image || tutor.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1000&q=85'}
              alt={course.title}
              className="video-banner-image"
            />
            <div className="video-overlay-gradient"></div>

            {/* Nút Play ở tâm */}
            <button
              type="button"
              className={`play-central-btn ${isPlaying ? 'playing' : ''}`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <Play size={28} fill="#fff" color="#fff" />
            </button>

            {/* Thanh điều khiển video phía dưới */}
            <div className="video-controls-bar">
              <button
                type="button"
                className="control-icon-btn"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                <Play size={16} fill="#fff" color="#fff" />
              </button>

              <div className="video-scrubber">
                <div className="scrubber-filled" style={{ width: isPlaying ? '68%' : '25%' }}></div>
                <div className="scrubber-knob" style={{ left: isPlaying ? '68%' : '25%' }}></div>
              </div>

              <span className="video-timestamp">{isPlaying ? '08:45' : '02:10'}</span>

              <button type="button" className="control-icon-btn">
                <Volume2 size={16} />
              </button>
              <button type="button" className="control-icon-btn">
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Khối 3 (Dưới - Trái): Giáo trình & Lộ trình (Material Accordion) */}
        <div className="pitch-card material-card">
          <div className="material-header">
            <h3>Giáo trình khóa học (Material)</h3>
            <span className="material-status-tag">3 Giai đoạn · 12 Buổi</span>
          </div>

          <div className="material-stages-list">
            {/* Stage 1 */}
            <div className="stage-block completed">
              <div
                className="stage-title-row"
                onClick={() => setActiveStage(activeStage === 1 ? null : 1)}
              >
                <div className="stage-left">
                  <span className="stage-check-icon">
                    <Check size={14} color="#fff" />
                  </span>
                  <div>
                    <div className="stage-num">Giai đoạn 1</div>
                    <div className="stage-name">Ôn tập toàn diện kiến thức nền tảng</div>
                  </div>
                </div>
                {activeStage === 1 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {activeStage === 1 && (
                <div className="stage-sublessons">
                  <div className="sublesson-item done">
                    <div className="sublesson-name">
                      <CheckCircle size={15} color="#07996e" />
                      <span>Hàm số, Cực trị và Đồ thị nâng cao</span>
                    </div>
                    <span className="sublesson-duration">45:10</span>
                  </div>
                  <div className="sublesson-item done">
                    <div className="sublesson-name">
                      <CheckCircle size={15} color="#07996e" />
                      <span>Mũ & Logarit: Các dạng toán thường gặp</span>
                    </div>
                    <span className="sublesson-duration">50:20</span>
                  </div>
                </div>
              )}
            </div>

            {/* Stage 2 */}
            <div className="stage-block in-progress">
              <div
                className="stage-title-row"
                onClick={() => setActiveStage(activeStage === 2 ? null : 2)}
              >
                <div className="stage-left">
                  <span className="stage-progress-circle">25%</span>
                  <div>
                    <div className="stage-num">Giai đoạn 2</div>
                    <div className="stage-name">Chuyên đề vận dụng cao 8+ và 9+</div>
                  </div>
                </div>
                {activeStage === 2 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {activeStage === 2 && (
                <div className="stage-sublessons">
                  <div className="sublesson-item done">
                    <div className="sublesson-name">
                      <CheckCircle size={15} color="#07996e" />
                      <span>Phương pháp đặt ẩn phụ & Chuẩn hóa số học</span>
                    </div>
                    <span className="sublesson-duration">12:23</span>
                  </div>
                  <div className="sublesson-item active">
                    <div className="sublesson-name">
                      <div className="sublesson-dot current"></div>
                      <span>Kỹ thuật bấm máy tính Casio xử lý tích phân khó</span>
                    </div>
                    <span className="sublesson-duration">12:25</span>
                  </div>
                  <div className="sublesson-item">
                    <div className="sublesson-name">
                      <div className="sublesson-dot"></div>
                      <span>Hình học không gian Oxyz: Khoảng cách và Góc</span>
                    </div>
                    <span className="sublesson-duration">12:23</span>
                  </div>
                </div>
              )}
            </div>

            {/* Stage 3 */}
            <div className="stage-block">
              <div
                className="stage-title-row"
                onClick={() => setActiveStage(activeStage === 3 ? null : 3)}
              >
                <div className="stage-left">
                  <span className="stage-empty-circle">0%</span>
                  <div>
                    <div className="stage-num">Giai đoạn 3</div>
                    <div className="stage-name">Luyện đề thi thử chuẩn cấu trúc HSA / THPTQG</div>
                  </div>
                </div>
                {activeStage === 3 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
          </div>
        </div>

        {/* Khối 4 (Dưới - Phải): Ghi chú & Đăng ký (Live Transcript & Action) */}
        <div className="pitch-card transcript-card">
          <div className="transcript-header">
            <h3>Ghi chú bài giảng & Trợ lý học tập</h3>
            <span className="live-status-pill">
              <span className="pulse-dot"></span> Trực tuyến
            </span>
          </div>

          <div className="ai-assistant-banner">
            <div className="assistant-avatar">
              <Sparkles size={18} color="#fff" />
            </div>
            <div className="assistant-info">
              <strong>HSA Assistant</strong>
              <span>Gia sư đồng hành 24/7</span>
            </div>
            <div className="waveform-animation">
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>

          <div className="transcript-body">
            <div className="transcript-entry">
              <span className="transcript-time">02:31</span>
              <p>
                <strong>Lưu ý quan trọng:</strong> Đối với bài toán cực trị hàm chứa dấu giá trị tuyệt đối, luôn xét điều kiện nghiệm của phương trình f'(x) = 0 trước khi lập bảng biến thiên.
              </p>
            </div>

            <div className="transcript-entry">
              <span className="transcript-time">02:45</span>
              <p>
                <strong>Công thức Casio:</strong> Sử dụng phím lệnh <code>[TABLE] (Mode 7 hoặc Menu 8)</code> với Bước nhảy (Step) = (End - Start) / 29 hoặc / 44 để quét toàn bộ nghiệm nguyên.
              </p>
            </div>

            <div className="transcript-entry">
              <span className="transcript-time">02:58</span>
              <p>
                <strong>Mẹo thi thử:</strong> Dành tối đa 35 phút đầu tiên cho 35 câu nhận biết - thông hiểu, 55 phút còn lại tập trung giải quyết 15 câu vận dụng cao.
              </p>
            </div>
          </div>

          {/* Nút hành động đăng ký giữ chỗ ngay */}
          <div className="transcript-action-footer">
            <button
              type="button"
              className={`pitch-enroll-btn ${isFull ? 'disabled' : ''}`}
              disabled={isFull}
              onClick={() => {
                setEnrollSuccess(false)
                setShowEnrollModal(true)
              }}
            >
              {isFull ? 'Lớp học đã đủ sĩ số' : `Đăng ký lớp học ngay (${Number(course.fee).toLocaleString('vi-VN')}đ)`}
            </button>
            <div className="enroll-guarantee-note">
              <ShieldCheck size={14} color="#07996e" />
              <span>Cam kết hoàn học phí 100% nếu học viên không tiến bộ sau 3 buổi.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Modal đăng ký lớp học */}
      {showEnrollModal && (
        <div className="modal-overlay" onClick={() => setShowEnrollModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Đăng ký lớp học</h3>
              <button className="close-btn" onClick={() => setShowEnrollModal(false)}>✕</button>
            </div>

            {enrollSuccess ? (
              <div className="modal-body success-state">
                <CheckCircle size={56} color="#07996e" style={{ margin: '0 auto 16px' }} />
                <h3>Đăng ký giữ chỗ thành công!</h3>
                <p>
                  Yêu cầu của bạn đã được chuyển tới hệ thống. Phụ trách Đăng ký & Thanh toán (Người C) sẽ liên hệ để xác nhận học phí <strong>{Number(course.fee).toLocaleString('vi-VN')}đ</strong>.
                </p>
                <button
                  className="pitch-orange-btn"
                  style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}
                  onClick={() => setShowEnrollModal(false)}
                >
                  Hoàn tất
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnrollSubmit} className="modal-form">
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                  Bạn đang đăng ký khóa học: <strong>{course.title}</strong> cùng gia sư <strong>{tutor.fullName}</strong>.
                </p>
                <div className="form-group">
                  <label>Họ và tên học viên *</label>
                  <input type="text" required placeholder="Nguyễn Văn A" defaultValue="Học viên mẫu" />
                </div>
                <div className="form-group">
                  <label>Số điện thoại liên hệ *</label>
                  <input type="tel" required placeholder="0912 345 678" defaultValue="0912345678" />
                </div>
                <div className="form-group">
                  <label>Email nhận tài liệu học *</label>
                  <input type="email" required placeholder="hocvien@gmail.com" defaultValue="hocvien@gmail.com" />
                </div>
                <div className="form-group">
                  <label>Ghi chú cho gia sư (nếu có)</label>
                  <textarea rows={3} placeholder="Ví dụ: Mục tiêu đạt 9 điểm Toán thi THPTQG, cần củng cố phần Hình không gian..." />
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowEnrollModal(false)}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="submit-btn" style={{ background: '#f97316' }}>
                    Xác nhận gửi yêu cầu ({Number(course.fee).toLocaleString('vi-VN')}đ)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
