import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search,
  Filter,
  Users,
  Star,
  Clock,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowUpDown,
  Tag,
  AlertCircle,
  Sparkles,
  Award,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  Flame,
  ArrowRight
} from 'lucide-react'
import { classService } from '../services/classService'

// Ảnh thumbnail tương ứng với từng môn học
const SUBJECT_THUMBNAILS = {
  'Toán THPT':      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
  'Tiếng Trung':    'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=600&q=80',
  'Vật Lý nâng cao':'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80',
  'Hóa học':        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
  'Tiếng Anh':      'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80',
}
const DEFAULT_THUMB = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80'

export default function ClassListPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // State tìm kiếm và bộ lọc
  const [keyword, setKeyword] = useState(searchParams.get('search') || '')
  const [selectedSubject, setSelectedSubject] = useState('Tất cả')
  const [selectedGrade, setSelectedGrade] = useState('Tất cả')
  const [selectedPriceRange, setSelectedPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)

  // State dữ liệu lớp học
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 6, totalItems: 0, totalPages: 1 })
  const [allClassesRaw, setAllClassesRaw] = useState([])

  // Cập nhật từ URL search param nếu có
  useEffect(() => {
    const query = searchParams.get('search')
    if (query !== null) {
      setKeyword(query)
    }
  }, [searchParams])

  // Danh mục môn học thống kê động
  const subjects = useMemo(() => {
    const list = [
      'Tất cả',
      'Toán THPT',
      'Tiếng Trung',
      'Vật Lý nâng cao',
      'Hóa học',
      'Tiếng Anh',
    ]
    return list.map((sub) => {
      const count =
        sub === 'Tất cả'
          ? allClassesRaw.length
          : allClassesRaw.filter((c) => c.subject === sub).length
      return { name: sub, count }
    })
  }, [allClassesRaw])

  // Lấy dữ liệu tất cả để đếm số lượng
  const fetchAllForCounts = async () => {
    try {
      const res = await classService.getClasses({ limit: 100 })
      setAllClassesRaw(res.classes)
    } catch (err) {
      console.error(err)
    }
  }

  // Tải danh sách lớp theo bộ lọc & phân trang
  const loadClasses = async () => {
    setLoading(true)
    try {
      const res = await classService.getClasses({
        keyword,
        subject: selectedSubject,
        gradeLevel: selectedGrade,
        priceRange: selectedPriceRange,
        sortBy,
        page: currentPage,
        limit: 6,
      })
      setClasses(res.classes)
      setPagination(res.pagination)
    } catch (err) {
      console.error('Lỗi khi tải danh sách lớp học:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllForCounts()
  }, [])

  useEffect(() => {
    loadClasses()
  }, [keyword, selectedSubject, selectedGrade, selectedPriceRange, sortBy, currentPage])

  const handleFilterChange = (setter, value) => {
    setter(value)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setKeyword('')
    setSelectedSubject('Tất cả')
    setSelectedGrade('Tất cả')
    setSelectedPriceRange('all')
    setSortBy('newest')
    setCurrentPage(1)
  }

  const isFiltered =
    keyword !== '' ||
    selectedSubject !== 'Tất cả' ||
    selectedGrade !== 'Tất cả' ||
    selectedPriceRange !== 'all' ||
    sortBy !== 'newest'

  return (
    <div className="coursera-explore-page">
      {/* 1. HERO BANNER CHUẨN COURSERA (Dark Background + 3 White Floating Feature Cards) */}
      <section className="coursera-hero-banner">
        <div className="hero-banner-inner">
          <div className="hero-text-content">
            <span className="hero-badge-pill">
              <Sparkles size={14} /> CHƯƠNG TRÌNH GIA SƯ CHẤT LƯỢNG CAO 2026
            </span>
            <h1 className="hero-heading">
              Khám phá Lớp học & Gia sư Chuyên nghiệp
            </h1>
            <p className="hero-description">
              Hệ thống học tập cá nhân hóa cùng các Thủ khoa, Giảng viên hàng đầu. Chuẩn bị vững chắc cho kỳ thi THPT Quốc Gia và Đánh giá năng lực HSA.
            </p>
          </div>

          {/* 3 Thẻ Đặc Điểm Nổi Bật Nổi Trên Nền Tối (Theo Đúng Ảnh Coursera) */}
          <div className="hero-three-cards-grid">
            <div className="hero-feature-card">
              <h3>Lộ trình học cá nhân hóa</h3>
              <p>
                Đánh giá chính xác năng lực đầu vào và xây dựng kế hoạch bứt phá điểm số phù hợp với từng học sinh.
              </p>
            </div>

            <div className="hero-feature-card">
              <h3>Học cùng Gia sư tinh hoa</h3>
              <p>
                Đội ngũ gia sư xuất sắc từ các trường ĐHQG, Sư Phạm, Bách Khoa, phương pháp sư phạm hiện đại.
              </p>
            </div>

            <div className="hero-feature-card">
              <h3>Thực chiến & Bứt phá điểm số</h3>
              <p>
                Luyện đề thi thử chuẩn cấu trúc HSA / THPTQG, rèn kỹ năng Casio và cam kết tiến bộ rõ rệt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LOGO PARTNERS STRIP (Learn from leading universities and companies) */}
      <section className="coursera-partners-strip">
        <div className="partners-inner">
          <p className="partners-title">
            Hợp tác & Kết nối cùng các trường đại học & tổ chức giáo dục hàng đầu
          </p>
          <div className="partners-logos-row">

            <div className="partner-logo-item">
              <img src="/logos/ptit.png" alt="PTIT" className="partner-uni-logo" />
            </div>

            <div className="partner-logo-item">
              <img src="/logos/vnu.jpg" alt="VNU" className="partner-uni-logo" />
            </div>

            <div className="partner-logo-item">
              <img src="/logos/hust.png" alt="HUST" className="partner-uni-logo" />
            </div>

            <div className="partner-logo-item">
              <img src="/logos/neu.png" alt="NEU" className="partner-uni-logo" />
            </div>

            <div className="partner-logo-item">
              <img src="/logos/hnue.png" alt="HNUE" className="partner-uni-logo" />
            </div>

          </div>
        </div>
      </section>

      {/* 3. CATALOG & COURSE SERIES SECTION (Tiêu đề + Bộ lọc + Danh sách thẻ) */}
      <section className="coursera-catalog-section" id="courses">
        <div className="catalog-section-inner">
          {/* Tiêu đề mục chính (Theo chuẩn Coursera Series Title) */}
          <div className="catalog-header-text">
            <h2>Các lớp học được thiết kế cho mục tiêu của bạn</h2>
            <p>
              Chọn lớp học phù hợp với khối lớp và môn học của bạn để bắt đầu đồng hành cùng gia sư ngay hôm nay.
            </p>
          </div>

          {/* THANH BỘ LỌC NGANG CHUẨN COURSERA */}
          <div className="coursera-filter-toolbar">
            {/* Hàng 1: Tabs môn học (Pills) */}
            <div className="coursera-tabs-row">
              {subjects.map((sub) => {
                const isActive = selectedSubject === sub.name
                return (
                  <button
                    key={sub.name}
                    type="button"
                    className={`coursera-tab-pill ${isActive ? 'active' : ''}`}
                    onClick={() => handleFilterChange(setSelectedSubject, sub.name)}
                  >
                    <span>{sub.name}</span>
                    <span className="pill-badge-count">{sub.count}</span>
                  </button>
                )
              })}
            </div>

            {/* Hàng 2: Bộ lọc Dropdowns + Tìm kiếm */}
            <div className="coursera-controls-row">
              <div className="controls-dropdowns-group">
                <div className="control-select-wrap">
                  <BookOpen size={14} className="control-select-icon" />
                  <select
                    className="control-select"
                    value={selectedGrade}
                    onChange={(e) => handleFilterChange(setSelectedGrade, e.target.value)}
                  >
                    <option value="Tất cả">Tất cả khối lớp</option>
                    <option value="Lớp 10">Khối Lớp 10</option>
                    <option value="Lớp 11">Khối Lớp 11</option>
                    <option value="Lớp 12">Khối Lớp 12</option>
                    <option value="Giao tiếp & Chứng chỉ">Giao tiếp & Chứng chỉ</option>
                    <option value="Luyện thi chứng chỉ">Luyện thi chứng chỉ</option>
                  </select>
                </div>

                <div className="control-select-wrap">
                  <Tag size={14} className="control-select-icon" />
                  <select
                    className="control-select"
                    value={selectedPriceRange}
                    onChange={(e) => handleFilterChange(setSelectedPriceRange, e.target.value)}
                  >
                    <option value="all">Tất cả mức học phí</option>
                    <option value="under-1m">Dưới 1.000.000đ</option>
                    <option value="1m-1.5m">1.000.000đ - 1.500.000đ</option>
                    <option value="above-1.5m">Trên 1.500.000đ</option>
                  </select>
                </div>

                <div className="control-select-wrap">
                  <ArrowUpDown size={14} className="control-select-icon" />
                  <select
                    className="control-select"
                    value={sortBy}
                    onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="price-asc">Học phí: Thấp đến Cao</option>
                    <option value="price-desc">Học phí: Cao đến Thấp</option>
                    <option value="students">Sĩ số đông nhất</option>
                  </select>
                </div>

                {isFiltered && (
                  <button
                    type="button"
                    className="coursera-reset-btn"
                    onClick={handleResetFilters}
                    title="Đặt lại toàn bộ bộ lọc"
                  >
                    <RotateCcw size={13} />
                    <span>Đặt lại</span>
                  </button>
                )}
              </div>

              <div className="controls-search-box">
                <Search size={15} className="controls-search-icon" />
                <input
                  type="text"
                  placeholder="Lọc nhanh theo từ khóa..."
                  value={keyword}
                  onChange={(e) => handleFilterChange(setKeyword, e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* DANH SÁCH THẺ KHÓA HỌC DẠNG COURSERA SERIES CARDS */}
          {loading ? (
            <div className="coursera-state-box">
              <div className="spinner"></div>
              <p>Đang tải danh sách lớp học...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="coursera-state-box empty">
              <AlertCircle size={44} color="#0056D2" style={{ margin: '0 auto 12px' }} />
              <h3>Không tìm thấy lớp học nào phù hợp</h3>
              <p>Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn lại các tiêu chí bộ lọc.</p>
              <button
                type="button"
                className="coursera-primary-btn"
                style={{ marginTop: '16px' }}
                onClick={handleResetFilters}
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="coursera-cards-grid">
              {classes.map((c) => {
                const tutor = c.tutorId || {}
                const isFull = c.currentStudents >= c.maxStudents || c.status === 'full'

                return (
                  <article key={c._id || c.id} className="coursera-series-card">
                    {/* Thumbnail + Overlay Badges */}
                    <div className="card-thumbnail-block">
                      <img
                        src={SUBJECT_THUMBNAILS[c.subject] || DEFAULT_THUMB}
                        alt={c.subject}
                        className="card-thumbnail-img"
                        onError={(e) => { e.target.src = DEFAULT_THUMB }}
                      />
                      <div className="card-thumbnail-overlay">
                        {/* Hàng trên: badge "HSA SERIES" + grade */}
                        <div className="card-badge-row">
                          <span className="card-series-pill">
                            <Flame size={11} /> HSA SERIES
                          </span>
                          <span className="card-grade-pill">{c.gradeLevel}</span>
                        </div>
                        {/* Tiêu đề môn đè lên góc dưới ảnh */}
                        <div className="card-subject-headline">{c.subject}</div>
                      </div>
                    </div>

                    {/* Phần thân trắng bên dưới */}
                    <div className="card-body-white">
                      {/* Tiêu đề lớp học (bold, 2 dòng max) */}
                      <h3 className="card-course-heading">
                        <Link to={`/classes/${c._id || c.id}`}>{c.title}</Link>
                      </h3>

                      {/* Mô tả: gia sư + lịch học */}
                      <p className="card-meta-desc">
                        Gia sư: <strong>{(c.tutorId || {}).fullName || 'HSA Tutor'}</strong> · {c.schedule}
                      </p>

                      {/* Info row: sĩ số + rating */}
                      <div className="card-info-row">
                        <span className="card-info-chip">
                          <Users size={13} /> {c.currentStudents}/{c.maxStudents} học viên
                        </span>
                        <span className="card-info-chip">
                          <Star size={13} fill="#f59e0b" color="#f59e0b" /> {(c.tutorId || {}).rating || '5.0'}
                        </span>
                        <span className={`card-info-chip ${isFull ? 'full' : 'open'}`}>
                          {isFull ? '● Đã đủ' : '● Mở nhận'}
                        </span>
                      </div>

                      {/* CTA Button */}
                      <button
                        type="button"
                        className="card-cta-link"
                        onClick={() => navigate(`/classes/${c._id || c.id}`)}
                      >
                        {isFull ? 'Xem chi tiết' : 'Đăng ký ngay'} <ArrowRight size={15} />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {/* Phân trang Chuẩn Coursera */}
          {pagination.totalPages > 1 && (
            <div className="coursera-pagination-bar">
              <button
                type="button"
                className="coursera-page-btn nav"
                disabled={pagination.page <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} /> Trang trước
              </button>

              <div className="page-numbers-track">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`coursera-page-btn num ${pagination.page === num ? 'active' : ''}`}
                    onClick={() => setCurrentPage(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="coursera-page-btn nav"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                Trang sau <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
