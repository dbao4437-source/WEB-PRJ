import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTutor } from '../api/tutorApi.js'
import { LEVEL_LABELS } from '../../constants/options.js'
import { avatarUrl } from '../utils/avatarUrl.js'

const formatMoney = amount => new Intl.NumberFormat('vi-VN').format(amount)
function InfoItem({ label, children }) {
  return <div className="profile-info-item"><span>{label}</span><strong>{children || 'Chưa cập nhật'}</strong></div>
}

export default function TutorProfile() {
  const { id } = useParams()
  const [tutor, setTutor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setMissing(false)
    getTutor(id).then(data => { if (active) setTutor(data) })
      .catch(() => { if (active) setMissing(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  if (loading) return <div className="tc-empty">Đang tải hồ sơ…</div>
  if (missing || !tutor) return <section className="tutor-profile-page"><Link className="tc-back" to="/tutors">← Quay lại danh sách</Link><div className="tc-empty">Không tìm thấy gia sư</div></section>

  const stats = tutor.stats || { studentsCount: 0, lessonsCount: 0, responseTime: 'Chưa cập nhật' }
  return (
    <section className="tutor-profile-page">
      <Link className="tc-back" to="/tutors">← Quay lại danh sách</Link>
      <header className="profile-header-card">
        <div className="profile-cover"><span>TRI THỨC · TẬN TÂM · TIẾN BỘ</span></div>
        <div className="profile-identity">
          {tutor.avatar ? <img className="profile-avatar" src={avatarUrl(tutor.avatar)} alt={tutor.name} /> : <span className="profile-avatar profile-avatar-fallback">{tutor.name?.charAt(0)||'?'}</span>}
          <div className="profile-identity-text">
            <h1>{tutor.name}</h1>
            <p>{(tutor.subjects||[]).join(' · ')} <i>•</i> {(tutor.areas||[]).join(', ')} <i>•</i> <strong>★ {Number(tutor.rating).toFixed(1)}</strong></p>
          </div>
          <button className="profile-book-button" type="button" onClick={() => alert('Tính năng đăng ký học thử sẽ sớm được cập nhật.')}>Đăng ký học thử</button>
        </div>
      </header>

      <div className="profile-columns">
        <aside className="profile-panel profile-personal">
          <h2>Thông tin cá nhân</h2>
          <InfoItem label="Học phí">{formatMoney(tutor.fee)} đ/giờ</InfoItem>
          <InfoItem label="Hình thức dạy">{tutor.mode === 'Cả hai' ? 'Online & Offline' : tutor.mode}</InfoItem>
          <InfoItem label="Kinh nghiệm">{tutor.experienceYears} năm</InfoItem>
          <InfoItem label="Trình độ / Học vấn">{tutor.education}</InfoItem>
          <InfoItem label="Chứng chỉ">{tutor.certificates?.join(', ')}</InfoItem>
          <InfoItem label="Khu vực dạy">{(tutor.areas||[]).join(", ")}</InfoItem><InfoItem label="Môn dạy">{(tutor.subjects||[]).join(", ")}</InfoItem><InfoItem label="Cấp lớp">{(tutor.levels||[]).map(level=>LEVEL_LABELS[level]||level).join(", ")}</InfoItem><InfoItem label="Chuyên ngành">{tutor.major}</InfoItem>
        </aside>

        <div className="profile-main-column">
          <section className="profile-panel profile-activity">
            <h2>Tổng quan hoạt động</h2>
            <div className="profile-stats">
              <article><strong>{stats.studentsCount}</strong><span>Học viên đã dạy</span></article>
              <article><strong>{stats.lessonsCount}</strong><span>Buổi đã hoàn thành</span></article>
              <article><strong>{stats.responseTime}</strong><span>Thời gian phản hồi</span></article>
            </div>
          </section>
          <section className="profile-panel profile-content-section">
            <h2>Giới thiệu &amp; phương pháp giảng dạy</h2><p>{tutor.bio}</p><p>{tutor.teachingStyle}</p>
          </section>
          <section className="profile-panel profile-content-section">
            <h2>Thành tích nổi bật</h2>
            <ul className="profile-achievements">{tutor.achievements?.map((item,index)=><li key={`${index}-${item}`}>{item}</li>)}</ul>
          </section>
          <section className="profile-panel profile-content-section">
            <h2>Lịch rảnh trong tuần</h2>
            <div className="profile-schedule">{tutor.availability.map((slot,index)=><span key={`${slot.day}-${slot.shift}-${index}`}>{slot.day} · {slot.shift}</span>)}</div>
            <p className="profile-note">Có thể chọn ca phù hợp khi đăng ký học thử.</p>
          </section>
          <section className="profile-panel profile-content-section">
            <h2>Đánh giá từ học viên</h2>
            <div className="profile-reviews">{tutor.reviews?.map((review,index)=><article key={`${review.studentName}-${index}`}>
              <div className="profile-review-head"><strong>{review.studentName}</strong><span>★ {Number(review.rating).toFixed(1)} <i>·</i> {review.date}</span></div>
              <p>{review.comment}</p>
            </article>)}</div>
          </section>
        </div>
      </div>
    </section>
  )
}

