import React, { useState, useEffect, useRef, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Search,
  BookOpen,
  User,
  LogOut,
  Sparkles,
  CheckCircle2,
  Layers,
  GraduationCap,
  Save,
  Award,
  ChevronDown,
  Clock3
} from 'lucide-react';
import './StudentDashboard.css';
import './TutorDashboard.css';
import NotificationCenter from './NotificationCenter';

type Enrollment = {
  _id: string;
  tutorName: string;
  subject: string;
  className: string;
  dayOfWeek?: number;
  startTime?: string;
  startDate?: string;
  endDate?: string;
  durationMinutes?: number;
  meetingLink?: string;
  curriculumLink?: string;
  attendanceStatus?: string;
  status?: string;
};

const namesForModal = ['Chủ Nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
const getLocalDateKey = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

type BookingSelectOption<T extends string | number> = {
  label: string;
  value: T;
};

function BookingSelect<T extends string | number>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T;
  options: BookingSelectOption<T>[];
  onChange: (value: T) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selectId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, isOpen]);

  const openSelect = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  };

  const moveFocus = (index: number) => {
    const nextIndex = Math.max(0, Math.min(options.length - 1, index));
    setActiveIndex(nextIndex);
    optionRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="booking-field-select-wrap" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="booking-select-trigger"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={selectId}
        onClick={() => isOpen ? setIsOpen(false) : openSelect()}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!isOpen) openSelect();
          }
        }}
      >
        <span>{options[selectedIndex]?.label ?? 'Chọn'}</span>
        <ChevronDown size={16} aria-hidden="true"/>
      </button>
      {isOpen && (
        <div className="booking-select-menu" id={selectId} role="listbox" aria-label={label}>
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(element) => { optionRefs.current[index] = element; }}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`booking-select-option${option.value === value ? ' selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  moveFocus(index + 1);
                } else if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  moveFocus(index - 1);
                } else if (event.key === 'Home') {
                  event.preventDefault();
                  moveFocus(0);
                } else if (event.key === 'End') {
                  event.preventDefault();
                  moveFocus(options.length - 1);
                } else if (event.key === 'Escape') {
                  event.preventDefault();
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }
              }}
            >
              <span>{option.label}</span>
              {option.value === value && <CheckCircle2 size={16} aria-hidden="true"/>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedule');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Enrollment | null>(null);
  const [selectedLessonDate, setSelectedLessonDate] = useState<Date | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [bookingTutor, setBookingTutor] = useState<any>(null);
  const [bookingDay, setBookingDay] = useState(1);
  const [bookingTime, setBookingTime] = useState('18:00');
  const [bookingStartDate, setBookingStartDate] = useState(() => getLocalDateKey(new Date()));
  const [bookingEndDate, setBookingEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return getLocalDateKey(date);
  });
  const [bookingSubject, setBookingSubject] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [overviewData, setOverviewData] = useState<any>(null);
  const [overviewError, setOverviewError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('http://localhost:5000/api/overview')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Không tải được dữ liệu tổng quan');
        if (!cancelled) setOverviewData(result.data);
      })
      .catch((error) => { if (!cancelled) setOverviewError(error instanceof Error ? error.message : 'Không kết nối được dữ liệu tổng quan'); });
    return () => { cancelled = true; };
  }, []);

  const saveEnrollment = async () => {
    if (!bookingTutor) return;
    const subject = bookingSubject.trim() || bookingTutor.subjectsTaught?.[0] || bookingTutor.subjects?.[0] || '';
    if (!subject) { setBookingMessage('Please enter the subject for this class.'); return; }
    if (!bookingStartDate || !bookingEndDate || bookingStartDate > bookingEndDate) {
      setBookingMessage('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          tutorId: bookingTutor._id,
          subject,
          dayOfWeek: bookingDay,
          startTime: bookingTime,
          startDate: bookingStartDate,
          endDate: bookingEndDate,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh',
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Không thể đăng ký lớp');
      setEnrollments((items) => [...items, result.data]);
      setBookingTutor(null);
      setBookingMessage('Đã xếp lịch lớp học thành công.');
    } catch (error) {
      setBookingMessage(error instanceof Error ? error.message : 'Không thể kết nối backend');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:5000/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Unable to load student profile');
        const user = result.data;
        setStudentInfo((current) => ({ ...current, name: user.fullName || '', email: user.email || '', phone: user.phone || '', gender: user.gender || '', birthYear: user.birthYear ? String(user.birthYear) : '', grade: user.grade || '', parentName: user.parentName || '', parentPhone: user.parentPhone || '' }));
        setEnrollments(Array.isArray(user.enrollments) ? user.enrollments : []);
      })
      .catch((error) => console.error('Unable to load student schedule:', error));
  }, []);

  // State quản l danh sch gia sư từ MongoDB v bộ lọc
  const [tutors, setTutors] = useState<any[]>([]);
  const [tutorsLoading, setTutorsLoading] = useState(false);
  const [tutorsError, setTutorsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('__all__');

  // State quản l form thng tin hồ sơ học vin/phụ huynh
  const [studentInfo, setStudentInfo] = useState({
    name: localStorage.getItem('userName') || '',
    email: localStorage.getItem('userEmail') || '',
    phone: '',
    gender: '',
    birthYear: '',
    grade: '',
    parentName: '',
    parentPhone: ''
  });;

  // GỌI API LƯU THNG TIN THẬT XUỐNG MONGODB
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Gửi km token xc thực của user
        },
        body: JSON.stringify({ fullName: studentInfo.name, phone: studentInfo.phone, gender: studentInfo.gender, birthYear: studentInfo.birthYear ? Number(studentInfo.birthYear) : null, grade: studentInfo.grade, parentName: studentInfo.parentName, parentPhone: studentInfo.parentPhone })
      });

      const result = await response.json();

      if (response.ok) {
        setStudentInfo((current) => ({ ...current, name: result.data.fullName || current.name, phone: result.data.phone || '', gender: result.data.gender || '', birthYear: result.data.birthYear ? String(result.data.birthYear) : '', grade: result.data.grade || '', parentName: result.data.parentName || '', parentPhone: result.data.parentPhone || '' }));
        localStorage.setItem('userName', result.data.fullName || '');
        alert('?? c?p nh?t th?ng tin th?nh c?ng.');
      } else {
        alert(`Lỗi từ server: ${result.message || 'Khng thể cập nhật'}`);
      }
    } catch (error) {
      console.error('Lỗi kết nối server:', error);
      alert('Khng thể kết nối đến server backend! Hy kiểm tra xem server đ bật chưa.');
    }
  };

  // Gọi API lấy dữ liệu gia sư từ MongoDB backend
  useEffect(() => {
    const controller = new AbortController();
    const loadTutors = async () => {
      setTutorsLoading(true);
      setTutorsError('');
      try {
        const query = new URLSearchParams({ keyword: searchTerm });
        if (selectedSubject !== '__all__') query.set('subject', selectedSubject);
        const response = await fetch(`http://localhost:5000/api/auth/tutors?${query}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to load tutors from MongoDB');
        if (!Array.isArray(data)) throw new Error('Tutor API returned an invalid response');
        setTutors(data);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setTutors([]);
        setTutorsError(error instanceof Error ? error.message : 'Unable to connect to the tutor service');
      } finally {
        if (!controller.signal.aborted) setTutorsLoading(false);
      }
    };
    loadTutors();
    return () => controller.abort();
  }, [searchTerm, selectedSubject]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    alert('Đ đăng xuất thnh cng!');
    navigate('/login');
  };

  const visibleEnrollments = enrollments.filter((item) => item.status !== 'rejected');
  const activeEnrollments = visibleEnrollments.filter((item) => item.status !== 'pending');
  const registeredSubjects = Array.from(visibleEnrollments.reduce((subjects, item) => {
    const name = item.subject.trim().normalize('NFC');
    const key = name.toLocaleLowerCase('vi-VN');
    if (name && !subjects.has(key)) subjects.set(key, name);
    return subjects;
  }, new Map<string, string>()).values());

  const navigation = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'schedule', label: 'Lịch học', icon: CalendarDays },
    { id: 'tutors', label: 'Tìm gia sư', icon: Search },
    { id: 'courses', label: 'Lớp học', icon: BookOpen },
    { id: 'profile', label: 'Tài khoản', icon: User },
  ];

  return (
    <div className="student-dashboard tutor-dashboard">
      <aside className="tutor-sidebar" aria-label="Điều hướng học viên">
        <button type="button" className="tutor-sidebar-brand" aria-label="TutorCenter - tổng quan" onClick={() => setActiveTab('overview')}>
          <span className="tutor-logo-mark">T</span>
          <span className="tutor-logo-caption">Tutor</span>
        </button>
        <nav className="tutor-sidebar-nav">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              title={label}
              aria-label={label}
              aria-current={activeTab === id ? 'page' : undefined}
              onClick={() => setActiveTab(id)}
              className={`tutor-sidebar-link${activeTab === id ? ' active' : ''}`}
            >
              <Icon size={19}/>
            </button>
          ))}
        </nav>
        <div className="tutor-sidebar-bottom">
          <div className="tutor-sidebar-notifications"><NotificationCenter/></div>
          <button type="button" className="tutor-sidebar-link tutor-sidebar-logout" title="Đăng xuất" aria-label="Đăng xuất" onClick={handleLogout}>
            <LogOut size={18}/>
          </button>
        </div>
      </aside>

      <div className="tutor-workspace">
        <header className="tutor-topbar">
          <div className="tutor-topbar-brand">
            <div className="tutor-brand-icon"><GraduationCap size={19}/></div>
            <div><strong>TutorCenter</strong><span>Không gian học viên</span></div>
          </div>
          <div className="tutor-topbar-user">
            <span>{studentInfo.name || 'Học viên / Phụ huynh'}</span>
            <div className="tutor-topbar-avatar"><User size={17}/></div>
          </div>
        </header>

      <main className="tutor-main student-main">

        {activeTab === 'schedule' && (() => {
          const monday = new Date(); monday.setHours(0,0,0,0); monday.setDate(monday.getDate()-((monday.getDay()+6)%7)+weekOffset*7);
          const days=Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(d.getDate()+i);return d;});
          const names=['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ Nhật'];
          const slots=['08:00','10:00','14:00','18:00','20:00'];
          const end=(t:string)=>{const [h,m]=t.split(':').map(Number);const d=new Date(2000,0,1,h,m+90);return d.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',hour12:false});};
          return <>
            <div className="student-banner"><span className="banner-tag"><CalendarDays size={13}/> Lộ trình học tập 1 kèm 1</span><h1>Lịch học của tôi</h1><p>Theo dõi các buổi học đã đăng ký của bạn.</p></div>
            <div className="student-toolbar"><div className="toolbar-left"><span>{'Tổng số lớp'}: {activeEnrollments.length}</span><button className="attendance-btn" onClick={()=>{const d=new Date();const lesson=activeEnrollments.find(x=>x.dayOfWeek===d.getDay());if(lesson)setSelectedLesson(lesson);}}><CheckCircle2 size={15}/> {'Xem buổi học hôm nay'}</button></div><div className="week-switch"><button className="week-btn" onClick={()=>setWeekOffset(x=>x-1)}>Tuần trước</button><button className={`week-btn ${weekOffset===0?'active':''}`} onClick={()=>setWeekOffset(0)}>Tuần này</button><button className="week-btn" onClick={()=>setWeekOffset(x=>x+1)}>Tuần sau</button></div></div>
            <div className="schedule-table-wrapper"><div className="schedule-header-row"><div>Khung giờ</div>{days.map((d,i)=><div key={i}>{names[i]}<span>{d.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'})}</span></div>)}</div>
              {slots.map(t=><div key={t} className="schedule-slot-row"><div className="slot-time">{t} - {end(t)}</div>{days.map((d,i)=>{const lesson=activeEnrollments.find(x=>x.dayOfWeek===d.getDay()&&x.startTime===t&&(!x.startDate||getLocalDateKey(d)>=x.startDate)&&(!x.endDate||getLocalDateKey(d)<=x.endDate));return <div key={i}>{lesson?<button className={`lesson-card-${lesson.attendanceStatus==='attended'?'mint':'blue'}`} onClick={()=>{setSelectedLessonDate(d);setSelectedLesson(lesson);}} style={{width:'calc(100% - 8px)',cursor:'pointer'}}><b>{lesson.subject}</b><br/>GV. {lesson.tutorName}</button>:<span>?</span>}</div>;})}</div>)}
              {activeEnrollments.length===0&&visibleEnrollments.some((item)=>item.status==='pending')&&<p style={{padding:20,color:'#854D0E'}}>Lớp học sẽ xuất hiện ở lịch sau khi gia sư xác nhận yêu cầu của bạn.</p>}
              {activeEnrollments.length===0&&visibleEnrollments.length===0&&<p style={{padding:20,color:'#854D0E'}}>Bạn chưa có lớp học. Lịch sẽ hiển thị sau khi các lớp được thêm và xác nhận.</p>}
              {activeEnrollments.length>0&&activeEnrollments.every(x=>x.dayOfWeek===undefined||!x.startTime)&&<p style={{padding:20,color:'#854D0E'}}>Các lớp hiện tại chưa có ngày, giờ học. Bấm vào lớp trong danh sách khóa học để xem thông tin.</p>}
            </div>
          </>;
        })()}
        {activeTab === 'overview' && (
          <section className="overview-page">
            <section className="overview-hero">
              <div className="overview-hero-copy">
                <span className="overview-eyebrow"><Sparkles size={14} /> {overviewData?.eyebrow || 'TutorCenter'}</span>
                <h1>{overviewData?.headline || 'Đang tải giới thiệu...'}<br /><span>{overviewData?.headlineAccent || ''}</span></h1>
                <p>{overviewError || overviewData?.description || 'Đang tải nội dung từ MongoDB...'}</p>
                <div className="overview-hero-actions"><button className="overview-primary-button" onClick={() => setActiveTab('tutors')}>Khám phá gia sư</button><a className="overview-text-link" href="#overview-partners">Tìm hiểu trung tâm</a></div>
                <div className="overview-hero-stats">{(overviewData?.stats || []).map((stat:any)=><div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div>
              </div>
              <div className="overview-hero-art"><div className="overview-orbit overview-orbit-one"/><div className="overview-orbit overview-orbit-two"/><div className="overview-book-card"><BookOpen size={54}/><span>Học tập thông minh</span></div><div className="overview-floating-cap"><GraduationCap size={23}/></div><div className="overview-floating-star"><Sparkles size={18}/></div><div className="overview-art-caption"><span/> Lộ trình riêng cho từng học viên</div></div>
            </section>
            <section id="overview-partners"><div className="overview-section-heading overview-partner-heading"><div><span className="overview-kicker">MẠNG LƯỚI ĐỐI TÁC</span><h2>Kết nối cùng các trường đại học hàng đầu</h2></div><p>Đội ngũ gia sư đến từ các trường đại học uy tín, mang kiến thức chuyên sâu và phương pháp học hiện đại.</p></div>
              <div className="overview-partner-grid">{(overviewData?.partners || []).slice().sort((a:any,b:any)=>a.order-b.order).map((partner:any)=><article className="overview-partner-card" key={partner.code}><img className="overview-partner-logo" src={partner.logo} alt={`Logo ${partner.name}`}/><div><strong>{partner.code}</strong><span>{partner.description}</span></div></article>)}</div>
            </section>
            <section><div className="overview-section-heading"><div><span className="overview-kicker">ĐỘI NGŨ GIẢNG VIÊN</span><h2>Người truyền cảm hứng học tập</h2></div></div>
              <div className="overview-faculty-grid">{(overviewData?.featuredTutors || []).map((lecturer:any)=><article className="overview-faculty-card" key={lecturer._id}><div className={`overview-faculty-photo ${lecturer.name.toLowerCase().includes('kevin')?'faculty-photo-kevin':''}`}>{lecturer.avatar?<img src={lecturer.avatar} alt={lecturer.name}/>:lecturer.name.toLowerCase().includes('kevin')?<img src="/images/featured-lecturer.jpg" alt={lecturer.name}/>:<div className="overview-faculty-placeholder"><User size={34}/><span>{lecturer.name.split(' ').slice(-1)[0]}</span></div>}<span className="overview-faculty-subject">Giảng viên</span></div><div className="overview-faculty-info"><span className="overview-faculty-title">{lecturer.title || 'Gia sư TutorCenter'}</span><h3>{lecturer.name}</h3><p>{lecturer.bio || 'Giảng viên đang cập nhật phần giới thiệu.'}</p><div className="overview-achievements"><Award size={16}/><span>{lecturer.achievements?.length ? lecturer.achievements.join(' · ') : `Chuyên môn: ${lecturer.subjects?.join(', ') || 'đang cập nhật'}`}</span></div></div></article>)}{overviewData && overviewData.featuredTutors.length===0 && <p className="overview-faculty-empty">Chưa có hồ sơ giảng viên trong MongoDB.</p>}</div>
            </section>
          </section>
        )}

        {activeTab === 'tutors' && (
          <>
            <div className="student-banner">
              <span className="banner-tag"><Search size={13} style={{ marginRight: 4 }} /> Gia sư từ MongoDB</span>
              <h1>Tìm gia sư phù hợp</h1>
              <p>Tìm theo tên hoặc môn học, xem thông tin giảng dạy và đăng ký lịch học trực tiếp.</p>
            </div>
            <div className="tutor-filter-bar">
              <div className="search-input-wrapper"><Search size={16} className="search-icon-abs"/><input type="search" placeholder="Tìm theo tên gia sư hoặc môn học" value={searchTerm} onChange={(event)=>setSearchTerm(event.target.value)}/></div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Layers size={15} style={{ position: 'absolute', left: 12, color: '#CA8A04', pointerEvents: 'none' }}/>
                <select className="filter-select" style={{ paddingLeft: 34 }} value={selectedSubject} onChange={(event)=>setSelectedSubject(event.target.value)}>
                  <option value="__all__">Tất cả môn dạy</option>
                  {[...new Set(tutors.flatMap((tutor:any)=>Array.isArray(tutor.subjectsTaught)&&tutor.subjectsTaught.length?tutor.subjectsTaught:Array.isArray(tutor.subjects)?tutor.subjects:[]))].map((subject)=><option key={subject} value={subject}>{subject}</option>)}
                </select>
              </div>
            </div>
            <div className="tutor-card-list">
              {tutorsLoading&&<p role="status">Đang tải danh sách gia sư…</p>}
              {tutorsError&&<p role="alert" style={{color:'#b91c1c'}}>{tutorsError}</p>}
              {!tutorsLoading&&!tutorsError&&tutors.length===0&&<p>Không tìm thấy gia sư phù hợp trong MongoDB.</p>}
              {tutors.map((tutor:any)=><article className="tutor-profile-card" key={tutor._id}>
                <div style={{display:'flex',gap:20,alignItems:'flex-start',flex:1}}>
                  {tutor.avatar?<img className="tutor-avatar-box" src={tutor.avatar} alt={tutor.fullName||tutor.name}/>:<div className="tutor-avatar-box"><User size={32}/></div>}
                  <div style={{flex:1}}>
                    <div className="tutor-tags-row"><span className="tag-yellow">★ {tutor.rating||5} ({tutor.reviewCount||0} đánh giá)</span><span className="tag-purple">{tutor.title||'Gia sư TutorCenter'}</span></div>
                    <h2 className="tutor-course-title" style={{fontSize:20,marginBottom:6}}>{tutor.fullName||tutor.name}</h2>
                    <div className="tutor-meta-info" style={{marginBottom:8,color:'#B45309',fontWeight:700}}>Môn dạy: {(tutor.subjectsTaught?.length?tutor.subjectsTaught:tutor.subjects||[]).join(', ')||'Chưa cập nhật'}</div>
                    <div className="tutor-desc-box"><b>Giới thiệu:</b> {tutor.bio||'Gia sư chưa cập nhật giới thiệu.'}</div>
                    <div className="tutor-meta-info"><span>Hình thức: {tutor.teachingForm||'Chưa cập nhật'}</span><span>Trạng thái: Đang nhận học viên</span></div>
                  </div>
                </div>
                <div className="tutor-card-right"><div><div className="price-text">{Number(tutor.pricePer25Min||0).toLocaleString('vi-VN')}₫<span style={{fontSize:12,fontWeight:500}}>/25 phút</span></div><div className="price-sub">Học phí tham khảo</div></div><button className="btn-primary-custom" onClick={()=>{setBookingMessage('');setBookingSubject(tutor.subjectsTaught?.[0]||tutor.subjects?.[0]||'');setBookingTutor(tutor);}}>Đặt lịch học ngay</button></div>
              </article>)}
            </div>
          </>
        )}

        {activeTab === 'courses' && (
          <section className="student-courses-panel">
            <h2>Lớp học của tôi</h2>
            {enrollments.length === 0 ? <p>Bạn chưa có lớp học nào.</p> : <div className="student-enrollment-list">{enrollments.map((item) => <article className="student-enrollment-card" key={item._id}>
              <strong>{item.className} · {item.subject}</strong>
              <span className={`enrollment-status enrollment-status-${item.status || 'active'}`}>{item.status === 'pending' ? 'Chờ gia sư xác nhận' : item.status === 'rejected' ? 'Yêu cầu chưa được nhận' : 'Đang học'}</span>
              <p>Gia sư: {item.tutorName}</p>
              <p>Lịch hằng tuần: {item.dayOfWeek !== undefined ? namesForModal[item.dayOfWeek] : 'Chưa xếp'} · {item.startTime || 'Chưa xếp giờ'}</p>
              <p>Thời hạn: {item.startDate || 'Chưa có ngày bắt đầu'} – {item.endDate || 'Chưa có ngày kết thúc'}</p>
              <button className="btn-outline-custom" onClick={() => { setSelectedLessonDate(null); setSelectedLesson(item); }}>Xem thông tin lớp</button>
            </article>)}</div>}
          </section>
        )}

        {activeTab === 'profile' && (
          <section className="student-profile-panel">
            <header className="student-profile-heading"><User size={22} color="#CA8A04"/><div><h2>Hồ sơ học viên &amp; phụ huynh</h2><p>Quản lý thông tin cá nhân, liên hệ và bảo mật tài khoản học tập của bạn.</p></div></header>
            <form onSubmit={handleSaveProfile} className="student-profile-form">
              <label>Họ và tên học viên<input type="text" value={studentInfo.name} onChange={(event)=>setStudentInfo({...studentInfo,name:event.target.value})} required /></label>
              <label>Email đăng nhập<input type="email" value={studentInfo.email} disabled /></label>
              <label>Số điện thoại học viên<input type="tel" value={studentInfo.phone} onChange={(event)=>setStudentInfo({...studentInfo,phone:event.target.value})} /></label>
              <div className="student-profile-form-field">
                <span>Giới tính</span>
                <BookingSelect
                  label="Giới tính"
                  value={studentInfo.gender}
                  options={[{ label: 'Chọn giới tính', value: '' }, { label: 'Nam', value: 'Nam' }, { label: 'Nữ', value: 'Nữ' }, { label: 'Khác', value: 'Khác' }]}
                  onChange={(gender) => setStudentInfo({...studentInfo,gender})}
                />
              </div>
              <label>Năm sinh<input type="number" min="1900" max={new Date().getFullYear()} placeholder="Ví dụ: 2007" value={studentInfo.birthYear} onChange={(event)=>setStudentInfo({...studentInfo,birthYear:event.target.value})} /></label>
              <label>Cấp học / khối lớp<input type="text" value={studentInfo.grade} onChange={(event)=>setStudentInfo({...studentInfo,grade:event.target.value})} /></label>
              <label>Họ tên phụ huynh<input type="text" value={studentInfo.parentName} onChange={(event)=>setStudentInfo({...studentInfo,parentName:event.target.value})} /></label>
              <label>Số điện thoại phụ huynh<input type="tel" value={studentInfo.parentPhone} onChange={(event)=>setStudentInfo({...studentInfo,parentPhone:event.target.value})} /></label>
              <button type="submit" className="btn-primary-custom"><Save size={16}/> Lưu thay đổi thông tin</button>
            </form>
            <section className="student-profile-subjects">
              <header>
                <div><h3>Môn học đã đăng ký</h3><p>Các môn đã đăng ký hoặc đang chờ gia sư xác nhận.</p></div>
                <span>{registeredSubjects.length} môn</span>
              </header>
              {registeredSubjects.length === 0 ? <p>Bạn chưa đăng ký môn học nào.</p> : (
                <div className="student-profile-subject-list">
                  {registeredSubjects.map((subject) => (
                    <span className="student-profile-subject" key={subject}><CheckCircle2 size={16}/>{subject}</span>
                  ))}
                </div>
              )}
            </section>
            <div className="student-profile-enrollments"><h3>Lớp học &amp; yêu cầu đăng ký</h3>{enrollments.length===0?<p>Bạn chưa đăng ký lớp học nào.</p>:enrollments.map((item)=><article key={item._id}><strong>{item.className} · {item.subject}</strong><span className={`enrollment-status enrollment-status-${item.status || 'active'}`}>{item.status === 'pending' ? 'Chờ gia sư xác nhận' : item.status === 'rejected' ? 'Yêu cầu chưa được nhận' : 'Đang học'}</span><span>Gia sư: {item.tutorName}</span><span>Lịch: {item.dayOfWeek!==undefined?namesForModal[item.dayOfWeek]:'Chưa xếp'} · {item.startTime||'Chưa xếp giờ'}</span><span>Thời hạn: {item.startDate||'Chưa có ngày bắt đầu'} – {item.endDate||'Chưa có ngày kết thúc'}</span></article>)}</div>
          </section>
        )}

      {bookingTutor && (
        <div className="booking-modal-backdrop" onClick={() => setBookingTutor(null)}>
          <section className="booking-modal" onClick={(event) => event.stopPropagation()}>
            <header className="booking-modal-header"><div className="booking-modal-icon"><CalendarDays size={19}/></div><div><h2>Xếp lịch lớp học</h2><p>Chọn môn, lịch hàng tuần và thời hạn học</p></div><button className="booking-modal-close" onClick={() => setBookingTutor(null)}>×</button></header>
            <div className="booking-tutor-summary"><span className="booking-tutor-avatar"><User size={18}/></span><div><small>GIA SƯ</small><strong>{bookingTutor.name || bookingTutor.fullName}</strong></div></div>
            <div className="booking-modal-fields">
              <label className="booking-field booking-field-subject"><span>Môn học</span><input value={bookingSubject} onChange={(event)=>setBookingSubject(event.target.value)} placeholder="Ví dụ: Toán học" required /></label>
              <label className="booking-field"><span>Ngày bắt đầu</span><input type="date" value={bookingStartDate} min={getLocalDateKey(new Date())} max={bookingEndDate} onChange={(event)=>setBookingStartDate(event.target.value)} required /></label>
              <label className="booking-field"><span>Ngày kết thúc</span><input type="date" value={bookingEndDate} min={bookingStartDate} onChange={(event)=>setBookingEndDate(event.target.value)} required /></label>
              <div className="booking-field booking-field-choice">
                <span className="booking-field-choice-label"><CalendarDays size={15}/>Ngày học hàng tuần</span>
                <BookingSelect
                  label="Ngày học hàng tuần"
                  value={bookingDay}
                  options={['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ Nhật'].map((day,index)=>({ label: day, value: (index+1)%7 }))}
                  onChange={setBookingDay}
                />
              </div>
              <div className="booking-field booking-field-choice">
                <span className="booking-field-choice-label"><Clock3 size={15}/>Giờ bắt đầu</span>
                <BookingSelect
                  label="Giờ bắt đầu"
                  value={bookingTime}
                  options={['08:00','10:00','14:00','18:00','20:00'].map((time)=>({ label: time, value: time }))}
                  onChange={setBookingTime}
                />
              </div>
            </div>
            {bookingMessage&&<p className="booking-modal-message" role="status">{bookingMessage}</p>}
            <footer className="booking-modal-footer"><button className="booking-cancel-button" onClick={()=>setBookingTutor(null)}>Hủy</button><button className="booking-confirm-button" onClick={saveEnrollment}><Save size={17}/> Xác nhận đăng ký</button></footer>
          </section>
        </div>
      )}
      {selectedLesson && (
        <div className="booking-modal-backdrop" onClick={()=>setSelectedLesson(null)}>
          <section className="booking-modal lesson-details-modal" onClick={(event)=>event.stopPropagation()}>
            <header className="booking-modal-header"><div className="booking-modal-icon"><CalendarDays size={19}/></div><div><h2>Thông tin lớp học</h2><p>Chi tiết lịch học của bạn</p></div><button className="booking-modal-close" onClick={()=>setSelectedLesson(null)}>×</button></header>
            <div className="lesson-details-card"><small>CA HỌC</small><p>{selectedLessonDate?selectedLessonDate.toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'}):namesForModal[selectedLesson.dayOfWeek??0]} · {selectedLesson.startTime||'Chưa xếp giờ'} · {selectedLesson.durationMinutes||90} phút</p><small>Thời hạn: {selectedLesson.startDate||'Chưa có ngày bắt đầu'} – {selectedLesson.endDate||'Chưa có ngày kết thúc'}</small></div>
            <div className="lesson-details-card"><small>HỌC SINH &amp; MÔN HỌC</small><h3>{studentInfo.name}</h3><p>Lớp {selectedLesson.className} · {selectedLesson.subject}</p><p>Gia sư: {selectedLesson.tutorName}</p><p>Điểm danh: {selectedLesson.attendanceStatus==='attended'?'Đã điểm danh':'Chưa điểm danh'}</p></div>
            <div className="lesson-details-links"><p>Phòng học: {selectedLesson.meetingLink?<a href={selectedLesson.meetingLink} target="_blank" rel="noreferrer">Mở phòng học</a>:'Chưa cập nhật'}</p><p>Giáo trình: {selectedLesson.curriculumLink?<a href={selectedLesson.curriculumLink} target="_blank" rel="noreferrer">Xem giáo trình</a>:'Chưa cập nhật'}</p></div>
            <footer className="booking-modal-footer"><button className="booking-cancel-button" onClick={()=>setSelectedLesson(null)}>Đóng</button></footer>
          </section>
        </div>
      )}
      </main>
      </div>
    </div>
  );
}
