import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Search, 
  BookOpen, 
  User, 
  Bell, 
  LogOut, 
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  GraduationCap,
  Monitor,
  Save
} from 'lucide-react';
import './StudentDashboard.css';
import { getLegacyProfile, saveLegacyProfile, searchLegacyTutors } from './api/legacyApi.js';
import { api } from './services/api';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedule');

  // State quản lý danh sách gia sư từ MongoDB và bộ lọc
  const [tutors, setTutors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Tất cả môn dạy');

  // State quản lý form thông tin hồ sơ học viên/phụ huynh
  const [studentInfo, setStudentInfo] = useState({
    name: '', email: '', phone: '', grade: '', parentName: '', parentPhone: ''
  });
  const [lessons, setLessons] = useState<any[]>([]);
  useEffect(() => {
    let active = true;
    getLegacyProfile().then((data: any) => { if (active) setStudentInfo({ name: data.fullName || data.name || '', email: data.email || '', phone: data.phone || '', grade: data.grade || '', parentName: data.parentName || '', parentPhone: data.parentPhone || '' }); }).catch(() => {});
    api.bookings().then(({ data }) => { if (active) setLessons(data.filter((booking: any) => booking.status === 'approved')); }).catch(() => { if (active) setLessons([]); });
    return () => { active = false; };
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await saveLegacyProfile({ fullName: studentInfo.name, phone: studentInfo.phone, grade: studentInfo.grade, parentName: studentInfo.parentName, parentPhone: studentInfo.parentPhone }); alert('Cập nhật hồ sơ thành công!'); }
    catch (error) { alert(error instanceof Error ? error.message : 'Không lưu được hồ sơ.'); }
  };

  useEffect(() => {
    let active = true;
    searchLegacyTutors(searchTerm, selectedSubject).then(data => { if (active && Array.isArray(data)) setTutors(data); }).catch(() => { if (active) setTutors([]); });
    return () => { active = false; };
  }, [searchTerm, selectedSubject]);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    alert('Đã đăng xuất thành công!');
    navigate('/login');
  };

  return (
    <div className="student-dashboard">
      
      {/* 1. HEADER TOP BAR */}
      <div className="student-header">
        
        {/* Logo & Thương hiệu */}
        <div className="student-brand">
          <div className="student-logo-box">T</div>
          <div>
            <div className="student-brand-title">Tutor<span>Center</span></div>
            <div className="student-brand-subtitle">Hệ thống học tập thông minh</div>
          </div>
        </div>

        {/* CÁC PHÍM TẮT ĐIỀU HƯỚNG */}
        <div className="student-nav-links">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`nav-link-item ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <LayoutDashboard size={15} style={{ marginRight: '6px' }} />
            Tổng quan
          </button>
          
          <button 
            onClick={() => setActiveTab('schedule')} 
            className={`nav-link-item ${activeTab === 'schedule' ? 'active' : ''}`}
          >
            <CalendarDays size={15} style={{ marginRight: '6px' }} />
            Lịch học
          </button>

          <button 
            onClick={() => setActiveTab('tutors')} 
            className={`nav-link-item ${activeTab === 'tutors' ? 'active' : ''}`}
          >
            <Search size={15} style={{ marginRight: '6px' }} />
            Tìm gia sư
          </button>

          <button 
            onClick={() => setActiveTab('courses')} 
            className={`nav-link-item ${activeTab === 'courses' ? 'active' : ''}`}
          >
            <BookOpen size={15} style={{ marginRight: '6px' }} />
            Khóa học
          </button>

          <button 
            onClick={() => setActiveTab('profile')} 
            className={`nav-link-item ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <User size={15} style={{ marginRight: '6px' }} />
            Tài khoản
          </button>
        </div>

        {/* Tiện ích góc phải */}
        <div className="student-header-actions">
          <div className="vip-badge">
            <Sparkles size={13} style={{ marginRight: '4px' }} /> VIP
          </div>
          
          <div className="notification-icon" title="Thông báo">
            <Bell size={17} color="#713F12" />
            <span className="notification-dot"></span>
          </div>

          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={14} style={{ marginRight: '4px' }} />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* 2. NỘI DUNG CHÍNH */}
      <div className="student-container">
        
        {activeTab === 'schedule' && (
          <>
            {/* BANNER */}
            <div className="student-banner">
              <span className="banner-tag">
                <CalendarDays size={13} style={{ marginRight: '4px' }} /> Lộ trình học tập 1 kèm 1
              </span>
              <h1>Lịch học của tôi</h1>
              <p>
                Theo dõi lịch học với gia sư, tham gia phòng học trực tuyến dễ dàng và quản lý thời gian hiệu quả.
              </p>
            </div>

            {/* TOOLBAR */}
            <div className="student-toolbar">
              <div className="toolbar-left">
                <select className="schedule-select">
                  <option>Ca học: Tất cả các ca</option>
                  <option>Ca sáng</option>
                  <option>Ca chiều</option>
                  <option>Ca tối</option>
                </select>
                <button className="attendance-btn">
                  <CheckCircle2 size={15} style={{ marginRight: '6px' }} /> Điểm danh nhanh
                </button>
              </div>

              <div className="week-switch">
                <button className="week-btn">Tuần trước</button>
                <button className="week-btn active">Tuần này</button>
                <button className="week-btn">Tuần sau</button>
              </div>
            </div>

            <section className="schedule-table-wrapper" aria-live="polite">
              <h2>Lịch học đã xác nhận</h2>
              {lessons.length ? lessons.map(lesson => <article key={lesson.id} className="schedule-slot-row">
                <strong>{lesson.subject} · {lesson.grade}</strong>
                <span>{lesson.schedule?.day || 'Ngày chưa chọn'} · {lesson.schedule?.shift || 'Ca chưa chọn'}</span>
                <span>Gia sư: {typeof lesson.tutorId === 'object' ? lesson.tutorId.fullName : 'Gia sư'}</span>
              </article>) : <p>Chưa có lịch học đã xác nhận.</p>}
            </section>
          </>
        )}

        {activeTab === 'overview' && (
          <div style={{ backgroundColor: '#fff', padding: '36px', borderRadius: '16px', border: '1px solid #FEF08A' }}>
            <h2 style={{ color: '#3D2B0F', marginBottom: '8px' }}>Tổng quan hệ thống học tập</h2>
            <p style={{ color: '#854D0E' }}>Chào mừng bạn quay trở lại! Bạn có các buổi học sắp diễn ra trong tuần này.</p>
          </div>
        )}

        {activeTab === 'tutors' && (
          <>
            {/* BANNER TÌM GIA SƯ */}
            <div className="student-banner">
              <span className="banner-tag">
                <Search size={13} style={{ marginRight: '4px' }} /> Đội ngũ gia sư chất lượng cao
              </span>
              <h1>Tìm kiếm & Đặt lịch gia sư</h1>
              <p>
                Khám phá đội ngũ gia sư uy tín từ hệ thống, xem chi tiết môn dạy, trình độ giảng dạy và học phí mỗi 25 phút để đặt lịch học 1 kèm 1 phù hợp nhất.
              </p>
            </div>

            {/* THANH TÌM KIẾM & BỘ LỌC KÈM ICON LUCIDE XỊN XÒ */}
            <div className="tutor-filter-bar">
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon-abs" />
                <input 
                  type="text" 
                  placeholder="Tìm theo tên gia sư, môn học..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Bộ lọc Môn học với icon Layers */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Layers size={15} style={{ position: 'absolute', left: '12px', color: '#CA8A04', pointerEvents: 'none' }} />
                <select 
                  className="filter-select" 
                  style={{ paddingLeft: '34px' }}
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option>Tất cả môn dạy</option>
                  <option>Toán học</option>
                  <option>Vật lý</option>
                  <option>Tiếng Anh</option>
                </select>
              </div>

              {/* Bộ lọc Trình độ với icon GraduationCap */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <GraduationCap size={15} style={{ position: 'absolute', left: '12px', color: '#CA8A04', pointerEvents: 'none' }} />
                <select className="filter-select" style={{ paddingLeft: '34px' }}>
                  <option>Trình độ: Tất cả</option>
                  <option>Thạc sĩ / Giỏi</option>
                </select>
              </div>

              {/* Bộ lọc Hình thức với icon Monitor */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Monitor size={15} style={{ position: 'absolute', left: '12px', color: '#CA8A04', pointerEvents: 'none' }} />
                <select className="filter-select" style={{ paddingLeft: '34px' }}>
                  <option>Hình thức: Online</option>
                  <option>Tại nhà</option>
                </select>
              </div>
            </div>

            {/* DANH SÁCH GIA SƯ LẤY TỪ MONGODB DƯỚI DẠNG THẺ THÔNG TIN CHI TIẾT */}
            <div className="tutor-card-list">
              {tutors.map((tutor: any) => (
                <div className="tutor-profile-card" key={tutor._id}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flex: 1 }}>
                    <div className="tutor-avatar-box">👨‍🏫</div>

                    <div style={{ flex: 1 }}>
                      <div className="tutor-tags-row">
                        <span className="tag-yellow">⭐ {tutor.rating || 5.0} ({tutor.reviewCount || 0} đánh giá)</span>
                        <span className="tag-purple">Trình độ: {tutor.title}</span>
                      </div>
                      
                      <div className="tutor-course-title" style={{ fontSize: '20px', marginBottom: '6px' }}>{tutor.name}</div>
                      
                      <div className="tutor-meta-info" style={{ marginBottom: '8px', color: '#B45309', fontWeight: 700 }}>
                        📚 Môn dạy: {Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : tutor.subjects}
                      </div>

                      <div className="tutor-desc-box">
                        <b>Giới thiệu:</b> {tutor.bio}
                      </div>

                      <div className="tutor-meta-info">
                        <span>💻 Hình thức: {tutor.teachingForm || 'Online 1 kèm 1'}</span>
                        <span>⏱️ Thời lượng: 25 phút / buổi</span>
                        <span style={{ color: '#10B981', fontWeight: 600 }}>✓ Đang nhận học sinh mới</span>
                      </div>
                    </div>
                  </div>

                  <div className="tutor-card-right">
                    <div>
                      <div className="price-text">{Number(tutor.pricePer25Min).toLocaleString()}đ<span style={{fontSize:'12px', fontWeight:500}}>/25 phút</span></div>
                      <div className="price-sub">Học phí chuẩn 1 kèm 1</div>
                    </div>

                    <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                      <button className="btn-outline-custom">Xem hồ sơ & Lịch trống</button>
                      <button className="btn-primary-custom" onClick={() => alert(`Đã gửi yêu cầu đặt lịch với ${tutor.name} thành công!`)}>
                        ĐẶT LỊCH HỌC NGAY
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'courses' && (
          <div style={{ backgroundColor: '#fff', padding: '36px', borderRadius: '16px', border: '1px solid #FEF08A' }}>
            <h2 style={{ color: '#3D2B0F', marginBottom: '12px' }}>Khóa học của tôi</h2>
            <p style={{ color: '#854D0E' }}>Danh sách tài liệu học tập và các bài luyện tập.</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={{ backgroundColor: '#fff', padding: '36px', borderRadius: '20px', border: '1px solid #FEF08A', boxShadow: '0 4px 15px rgba(234,179,8,0.05)' }}>
            <h2 style={{ color: '#3D2B0F', marginBottom: '8px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={22} color="#CA8A04" /> Hồ sơ học viên & Phụ huynh
            </h2>
            <p style={{ color: '#854D0E', marginBottom: '24px' }}>
              Quản lý thông tin cá nhân, số điện thoại liên hệ và bảo mật tài khoản học tập của bạn.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label style={{ fontWeight: 600, color: '#713F12', display: 'block', marginBottom: '8px' }}>Họ và tên học viên</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={studentInfo.name} 
                  onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #FEF08A' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, color: '#713F12', display: 'block', marginBottom: '8px' }}>Email đăng nhập</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={studentInfo.email} 
                  disabled 
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #FEF08A', background: '#FEFCF0', color: '#716B5F' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, color: '#713F12', display: 'block', marginBottom: '8px' }}>Số điện thoại học viên</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={studentInfo.phone} 
                  onChange={(e) => setStudentInfo({...studentInfo, phone: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #FEF08A' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, color: '#713F12', display: 'block', marginBottom: '8px' }}>Cấp học / Khối lớp</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={studentInfo.grade} 
                  onChange={(e) => setStudentInfo({...studentInfo, grade: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #FEF08A' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, color: '#713F12', display: 'block', marginBottom: '8px' }}>Họ tên Phụ huynh</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={studentInfo.parentName} 
                  onChange={(e) => setStudentInfo({...studentInfo, parentName: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #FEF08A' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, color: '#713F12', display: 'block', marginBottom: '8px' }}>Số điện thoại Phụ huynh</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={studentInfo.parentPhone} 
                  onChange={(e) => setStudentInfo({...studentInfo, parentPhone: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #FEF08A' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                <button type="submit" className="btn-primary-custom" style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <Save size={16} /> Lưu thay đổi thông tin
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}



