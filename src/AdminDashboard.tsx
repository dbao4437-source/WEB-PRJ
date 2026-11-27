import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowUpRight, Bell, BookOpen, Check, ClipboardList, GraduationCap, History, LayoutDashboard, LogOut, Search, ShieldAlert, ShieldCheck, Users, UserRoundCheck, UserRoundX } from 'lucide-react';
import { ActivityPanel, AlertPanel, SessionPanel, TutorPanel } from './AdminManagementPanels';
import './AdminDashboard.css';

type AdminUser = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'student' | 'tutor' | 'admin';
  status: 'active' | 'blocked';
  createdAt: string;
};

type DashboardData = {
  stats: { totalUsers: number; students: number; tutors: number; blockedUsers: number; pendingEnrollments: number };
  users: AdminUser[];
  enrollments: AdminEnrollment[];
  studentDirectory: AdminStudent[];
  tutors: AdminTutor[];
  alerts: AdminAlert[];
  auditLogs: AdminAuditEntry[];
};

type AdminStudent = { _id: string; fullName: string; grade: string; classCount: number };
export type AdminTutor = { _id: string; fullName: string; email: string; phone: string; status: 'active' | 'blocked'; title: string; subjects: string[]; institution: string; major: string; rating: number; reviewCount: number; classCount: number; pendingCount: number };
export type AdminAlert = { id: string; enrollmentId: string; studentId: string; type: 'pending' | 'missing-link' | 'missing-schedule'; title: string; detail: string };
export type AdminAuditEntry = { _id: string; actorName: string; action: string; targetType: string; targetLabel: string; details: string; createdAt: string };

export type AdminEnrollment = {
  _id: string;
  studentId: string;
  studentName: string;
  grade: string;
  className: string;
  subject: string;
  tutorName: string;
  dayOfWeek?: number;
  startTime: string;
  startDate: string;
  endDate: string;
  durationMinutes: number;
  status: string;
  meetingLink: string;
  sessions: Array<{ lessonDate: string; completedAt?: string | null; rating?: number; feedback?: string }>;
};

const roleNames: Record<AdminUser['role'], string> = { student: 'Học viên', tutor: 'Gia sư', admin: 'Quản trị viên' };
const normalizeSearchText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLocaleLowerCase('vi-VN');
const toDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const buildUpcomingSessions = (enrollments: AdminEnrollment[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 14 }, (_, offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    return { date, dateKey: toDateKey(date) };
  }).flatMap(({ date, dateKey }) => enrollments
    .filter((enrollment) => enrollment.status === 'active'
      && enrollment.dayOfWeek === date.getDay()
      && Boolean(enrollment.startTime)
      && (!enrollment.startDate || dateKey >= enrollment.startDate)
      && (!enrollment.endDate || dateKey <= enrollment.endDate))
    .map((enrollment) => ({ enrollment, lessonDate: dateKey })))
    .sort((a, b) => `${a.lessonDate} ${a.enrollment.startTime}`.localeCompare(`${b.lessonDate} ${b.enrollment.startTime}`));
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState<'overview' | 'accounts' | 'classes' | 'sessions' | 'tutors' | 'alerts' | 'activity'>('overview');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [savingId, setSavingId] = useState('');
  const [savingLinkId, setSavingLinkId] = useState('');
  const [linkDrafts, setLinkDrafts] = useState<Record<string, string>>({});
  const [classQuery, setClassQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [savingEnrollmentId, setSavingEnrollmentId] = useState('');

  const loadDashboard = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Không thể tải dữ liệu quản trị');
      setData(result.data);
      setLinkDrafts(Object.fromEntries((result.data.enrollments || []).map((item: AdminEnrollment) => [item._id, item.meetingLink || ''])));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const filteredUsers = useMemo(() => (data?.users || []).filter((user) => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const text = `${user.fullName} ${user.email} ${user.phone || ''}`.toLocaleLowerCase();
    return matchesRole && text.includes(query.trim().toLocaleLowerCase());
  }), [data, query, roleFilter]);

  const matchingStudents = useMemo(() => (data?.studentDirectory || []).filter((student) =>
    normalizeSearchText(student.fullName).includes(normalizeSearchText(classQuery.trim()))
  ).slice(0, 30), [classQuery, data]);
  const selectedStudent = data?.studentDirectory.find((student) => student._id === selectedStudentId);
  const studentEnrollments = useMemo(() => (data?.enrollments || []).filter((item) => item.studentId === selectedStudentId), [data, selectedStudentId]);
  const upcomingSessions = useMemo(() => buildUpcomingSessions(data?.enrollments || []), [data]);
  const completedSessions = useMemo(() => (data?.enrollments || []).flatMap((enrollment) => (enrollment.sessions || [])
    .filter((session) => session.completedAt)
    .map((session) => ({ enrollment, session })))
    .sort((a, b) => b.session.lessonDate.localeCompare(a.session.lessonDate)), [data]);

  const toggleStatus = async (user: AdminUser) => {
    setSavingId(user._id);
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/auth/admin/status/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status: user.status === 'active' ? 'blocked' : 'active' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Không thể cập nhật tài khoản');
      await loadDashboard();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Không thể cập nhật tài khoản');
    } finally {
      setSavingId('');
    }
  };

  const saveMeetingLink = async (enrollment: AdminEnrollment) => {
    setSavingLinkId(enrollment._id);
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/auth/admin/students/${enrollment.studentId}/enrollments/${enrollment._id}/meeting-link`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ meetingLink: linkDrafts[enrollment._id] || '' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Không thể cập nhật link phòng học');
      setData((current) => current ? {
        ...current,
        enrollments: current.enrollments.map((item) => item._id === enrollment._id ? { ...item, meetingLink: result.data.meetingLink } : item),
      } : current);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Không thể cập nhật link phòng học');
    } finally {
      setSavingLinkId('');
    }
  };

  const decideEnrollment = async (enrollment: AdminEnrollment, status: 'active' | 'rejected') => {
    setSavingEnrollmentId(enrollment._id);
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/auth/admin/students/${enrollment.studentId}/enrollments/${enrollment._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Không thể cập nhật yêu cầu lớp học');
      await loadDashboard();
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Không thể cập nhật yêu cầu lớp học');
    } finally {
      setSavingEnrollmentId('');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const stats = data?.stats;
  const sectionTitles = {
    overview: 'Bảng điều khiển', accounts: 'Quản lý tài khoản', classes: 'Lớp học & phòng học',
    sessions: 'Theo dõi buổi học', tutors: 'Quản lý gia sư', alerts: 'Cảnh báo cần xử lý', activity: 'Lịch sử hoạt động',
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><span className="admin-brand-mark">T</span><span>Tutor<span>Center</span><small>QUẢN TRỊ HỆ THỐNG</small></span></div>
        <div className="admin-sidebar-label">KHÔNG GIAN LÀM VIỆC</div>
        <nav className="admin-sidebar-nav">
          <button className={`admin-nav-item ${section === 'overview' ? 'active' : ''}`} onClick={() => setSection('overview')}><LayoutDashboard size={18}/>Tổng quan</button>
          <button className={`admin-nav-item ${section === 'accounts' ? 'active' : ''}`} onClick={() => setSection('accounts')}><Users size={18}/>Tài khoản</button>
          <button className={`admin-nav-item ${section === 'classes' ? 'active' : ''}`} onClick={() => setSection('classes')}><BookOpen size={18}/>Lớp học &amp; phòng học</button>
          <button className={`admin-nav-item ${section === 'sessions' ? 'active' : ''}`} onClick={() => setSection('sessions')}><ClipboardList size={18}/>Buổi học</button>
          <button className={`admin-nav-item ${section === 'tutors' ? 'active' : ''}`} onClick={() => setSection('tutors')}><GraduationCap size={18}/>Gia sư</button>
          <button className={`admin-nav-item ${section === 'alerts' ? 'active' : ''}`} onClick={() => setSection('alerts')}><ShieldAlert size={18}/>Cảnh báo{data?.alerts?.length ? ` · ${data.alerts.length}` : ''}</button>
          <button className={`admin-nav-item ${section === 'activity' ? 'active' : ''}`} onClick={() => setSection('activity')}><History size={18}/>Lịch sử</button>
        </nav>
        <div className="admin-sidebar-bottom"><div className="admin-security-note"><ShieldCheck size={17}/><span><strong>Truy cập bảo mật</strong><small>Phiên quản trị đang hoạt động</small></span></div><button className="admin-logout" onClick={logout}><LogOut size={17}/>Đăng xuất</button></div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar"><div><span className="admin-breadcrumb">TutorCenter <span>/</span> {sectionTitles[section]}</span><h1>{sectionTitles[section]}</h1></div><div className="admin-topbar-right"><span className="admin-live-dot">Dữ liệu MongoDB</span><button className="admin-notification" aria-label="Thông báo"><Bell size={18}/></button><div className="admin-user-chip"><span>AD</span><div><strong>Quản trị viên</strong><small>Admin</small></div></div></div></header>

        {error && <div className="admin-alert" role="alert">{error}<button onClick={() => void loadDashboard()}>Thử lại</button></div>}
        {loading && !data ? <div className="admin-loading"><span/>Đang tải dữ liệu từ MongoDB…</div> : section === 'overview' ? (
          <div className="admin-content">
            <section className="admin-welcome"><div><span className="admin-eyebrow">TRUNG TÂM ĐIỀU HÀNH</span><h2>Xin chào, Quản trị viên</h2><p>Theo dõi hoạt động và quản lý tài khoản trên toàn hệ thống TutorCenter.</p></div><div className="admin-welcome-art"><Activity size={30}/><span>Hệ thống<br/>đang hoạt động</span></div></section>
            <section className="admin-stat-grid">
              <article className="admin-stat-card"><div className="admin-stat-top"><span>Tổng tài khoản</span><span className="admin-stat-icon violet"><Users size={18}/></span></div><strong>{stats?.totalUsers ?? '—'}</strong><small><ArrowUpRight size={14}/> Tài khoản trong hệ thống</small></article>
              <article className="admin-stat-card"><div className="admin-stat-top"><span>Học viên</span><span className="admin-stat-icon blue"><GraduationCap size={18}/></span></div><strong>{stats?.students ?? '—'}</strong><small>Đang sử dụng nền tảng</small></article>
              <article className="admin-stat-card"><div className="admin-stat-top"><span>Gia sư</span><span className="admin-stat-icon amber"><BookOpen size={18}/></span></div><strong>{stats?.tutors ?? '—'}</strong><small>Hồ sơ gia sư đã đăng ký</small></article>
              <article className="admin-stat-card"><div className="admin-stat-top"><span>Yêu cầu chờ xử lý</span><span className="admin-stat-icon rose"><Activity size={18}/></span></div><strong>{stats?.pendingEnrollments ?? '—'}</strong><small>Các lớp đang chờ xác nhận</small></article>
            </section>
            <section className="admin-panel admin-overview-alerts"><div className="admin-panel-heading"><div><span className="admin-eyebrow">THEO DÕI HỆ THỐNG</span><h3>{data?.alerts?.length ? `${data.alerts.length} mục cần chú ý` : 'Không có cảnh báo mới'}</h3></div><button className="admin-text-button" onClick={() => setSection('alerts')}>Mở cảnh báo <ArrowUpRight size={15}/></button></div>{data?.alerts?.length ? data.alerts.slice(0, 3).map((alert) => <button className="admin-overview-alert-row" key={alert.id} onClick={() => { if (alert.type === 'pending') setSection('alerts'); else { setSelectedStudentId(alert.studentId); setClassQuery(''); setSection('classes'); } }}><span>{alert.title}</span><small>{alert.detail}</small><ArrowUpRight size={14}/></button>) : <div className="admin-health-row"><span className="admin-health-indicator"><Check size={14}/></span><div><strong>Các lớp đã được kiểm tra</strong><small>Chưa có yêu cầu chờ hoặc lớp thiếu thông tin.</small></div></div>}</section>
            <section className="admin-lower-grid">
              <article className="admin-panel admin-quick-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">QUẢN LÝ</span><h3>Truy cập nhanh</h3></div></div><button className="admin-quick-link" onClick={() => setSection('accounts')}><span className="admin-quick-icon"><Users size={18}/></span><span><strong>Danh sách tài khoản</strong><small>Tìm, lọc và cập nhật trạng thái</small></span><ArrowUpRight size={17}/></button><div className="admin-health-row"><span className="admin-health-indicator"><Check size={14}/></span><div><strong>Kết nối cơ sở dữ liệu</strong><small>MongoDB · tutor_center</small></div><span className="admin-health-status">Đã kết nối</span></div></article>
              <article className="admin-panel admin-summary-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">TÀI KHOẢN</span><h3>Tình hình hệ thống</h3></div></div><div className="admin-summary-row"><span><UserRoundCheck size={16}/> Đang hoạt động</span><strong>{Math.max((stats?.totalUsers || 0) - (stats?.blockedUsers || 0), 0)}</strong></div><div className="admin-summary-row"><span><UserRoundX size={16}/> Đã tạm khóa</span><strong>{stats?.blockedUsers ?? '—'}</strong></div><div className="admin-summary-footer"><span>Tổng số học viên và gia sư</span><strong>{(stats?.students || 0) + (stats?.tutors || 0)}</strong></div></article>
            </section>
            <section className="admin-panel admin-recent-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">MỚI THAM GIA</span><h3>Tài khoản gần đây</h3></div><button className="admin-text-button" onClick={() => setSection('accounts')}>Xem tất cả <ArrowUpRight size={15}/></button></div><UserTable users={(data?.users || []).slice(0, 5)} savingId={savingId} onToggle={toggleStatus}/></section>
          </div>
        ) : section === 'classes' ? (
          <div className="admin-content">
            <section className="admin-panel admin-classes-panel">
              <div className="admin-panel-heading"><div><span className="admin-eyebrow">LỚP HỌC &amp; LỊCH DẠY</span><h3>{selectedStudent ? `Lớp học của ${selectedStudent.fullName}` : 'Tìm học viên để quản lý lớp'}</h3><p>Nhập tên học viên, chọn đúng người trong kết quả rồi cập nhật link cho các lớp của bạn ấy.</p></div><button className="admin-refresh-button" onClick={() => void loadDashboard()}><Activity size={15}/> Làm mới</button></div>
              <label className="admin-search admin-class-search"><Search size={17}/><input value={classQuery} onChange={(event) => { setClassQuery(event.target.value); setSelectedStudentId(''); }} placeholder="Nhập tên học viên…"/></label>
              {selectedStudent ? <>
                <div className="admin-selected-student"><div><span>{selectedStudent.fullName.trim().charAt(0).toLocaleUpperCase('vi-VN') || 'H'}</span><div><strong>{selectedStudent.fullName}</strong><small>{selectedStudent.grade ? `Lớp ${selectedStudent.grade}` : 'Chưa cập nhật khối lớp'} · {studentEnrollments.length} lớp</small></div></div><button onClick={() => setSelectedStudentId('')}>Đổi học viên</button></div>
                {studentEnrollments.length ? <div className="admin-class-list">{studentEnrollments.map((item) => <article className="admin-class-card" key={item._id}>
                <div className="admin-class-heading"><div><span className="admin-role-badge student">{item.status === 'pending' ? 'Chờ gia sư xác nhận' : item.status === 'rejected' ? 'Đã từ chối' : 'Đang học'}</span><h4>{item.subject} <small>· {item.className || `Lớp ${item.grade || 'chưa rõ'}`}</small></h4></div><span className="admin-class-sessions">{item.sessions?.length || 0} buổi đã ghi nhận</span></div>
                <div className="admin-class-people"><div><small>HỌC VIÊN</small><strong>{item.studentName}</strong></div><div><small>GIA SƯ</small><strong>{item.tutorName}</strong></div></div>
                <div className="admin-class-schedule"><span><strong>Lịch:</strong> {item.dayOfWeek === undefined ? 'Chưa xếp ngày' : ['Chủ Nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'][item.dayOfWeek]} · {item.startTime || 'Chưa xếp giờ'} · {item.durationMinutes || 90} phút</span><span><strong>Thời hạn:</strong> {item.startDate || 'Chưa đặt'} – {item.endDate || 'Chưa đặt'}</span></div>
                {item.sessions?.length > 0 && <div className="admin-class-session-list"><strong>Buổi đã ghi nhận:</strong>{item.sessions.slice().sort((a, b) => b.lessonDate.localeCompare(a.lessonDate)).map((session) => <span key={session.lessonDate}>{session.lessonDate}{session.completedAt ? ' · Hoàn thành' : ' · Chưa hoàn thành'}</span>)}</div>}
                {item.status === 'pending' && <div className="admin-enrollment-actions"><span>Yêu cầu này đang chờ duyệt</span><div><button type="button" className="admin-approve-button" disabled={savingEnrollmentId === item._id} onClick={() => void decideEnrollment(item, 'active')}>{savingEnrollmentId === item._id ? 'Đang lưu…' : 'Duyệt lớp'}</button><button type="button" className="admin-reject-button" disabled={savingEnrollmentId === item._id} onClick={() => void decideEnrollment(item, 'rejected')}>Từ chối</button></div></div>}
                <form className="admin-meeting-link-form" onSubmit={(event) => { event.preventDefault(); void saveMeetingLink(item); }}><label htmlFor={`meeting-link-${item._id}`}>LINK PHÒNG HỌC</label><div><input id={`meeting-link-${item._id}`} type="url" value={linkDrafts[item._id] || ''} onChange={(event) => setLinkDrafts((current) => ({ ...current, [item._id]: event.target.value }))} placeholder="https://meet.google.com/..."/><button type="submit" disabled={savingLinkId === item._id}>{savingLinkId === item._id ? 'Đang lưu…' : 'Lưu link phòng'}</button></div>{item.meetingLink && <a className="admin-current-link" href={item.meetingLink} target="_blank" rel="noreferrer">Mở link hiện tại ↗</a>}</form>
                </article>)}</div> : <div className="admin-class-empty"><BookOpen size={25}/><strong>Học viên này chưa có lớp học</strong><span>Các lớp sẽ xuất hiện sau khi học viên gửi yêu cầu đăng ký.</span></div>}
              </> : <div className="admin-student-results">{matchingStudents.length ? matchingStudents.map((student) => <button className="admin-student-result" key={student._id} onClick={() => setSelectedStudentId(student._id)}><span className="admin-avatar">{student.fullName.trim().charAt(0).toLocaleUpperCase('vi-VN') || 'H'}</span><span><strong>{student.fullName}</strong><small>{student.grade ? `Lớp ${student.grade}` : 'Chưa cập nhật khối lớp'}</small></span><em>{student.classCount} lớp</em><ArrowUpRight size={16}/></button>) : <div className="admin-class-empty"><Users size={24}/><strong>Không tìm thấy học viên</strong><span>Thử nhập họ tên đầy đủ hoặc một phần tên.</span></div>}</div>}
            </section>
          </div>
        ) : section === 'sessions' ? (
          <div className="admin-content"><SessionPanel upcoming={upcomingSessions} completed={completedSessions}/></div>
        ) : section === 'tutors' ? (
          <div className="admin-content"><TutorPanel tutors={data?.tutors || []} savingId={savingId} onToggle={toggleStatus}/></div>
        ) : section === 'alerts' ? (
          <div className="admin-content"><AlertPanel alerts={data?.alerts || []} enrollments={data?.enrollments || []} savingId={savingEnrollmentId} onDecide={decideEnrollment} onOpenClass={(studentId) => { setSelectedStudentId(studentId); setClassQuery(''); setSection('classes'); }}/></div>
        ) : section === 'activity' ? (
          <div className="admin-content"><ActivityPanel entries={data?.auditLogs || []}/></div>
        ) : (
          <div className="admin-content"><section className="admin-panel admin-accounts-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">DANH BẠ HỆ THỐNG</span><h3>Tài khoản người dùng</h3><p>Thông tin được tải trực tiếp từ cơ sở dữ liệu MongoDB.</p></div><button className="admin-refresh-button" onClick={() => void loadDashboard()}><Activity size={15}/> Làm mới</button></div><div className="admin-account-toolbar"><label className="admin-search"><Search size={17}/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Tìm theo tên, email hoặc số điện thoại"/></label><select value={roleFilter} onChange={(event)=>setRoleFilter(event.target.value)}><option value="all">Tất cả vai trò</option><option value="student">Học viên</option><option value="tutor">Gia sư</option><option value="admin">Quản trị viên</option></select></div><UserTable users={filteredUsers} savingId={savingId} onToggle={toggleStatus} emptyMessage="Không tìm thấy tài khoản phù hợp."/></section></div>
        )}
      </main>
    </div>
  );
}

function UserTable({ users, savingId, onToggle, emptyMessage = 'Chưa có tài khoản nào.' }: { users: AdminUser[]; savingId: string; onToggle: (user: AdminUser) => void; emptyMessage?: string }) {
  return <div className="admin-table-wrap"><table className="admin-user-table"><thead><tr><th>NGƯỜI DÙNG</th><th>VAI TRÒ</th><th>NGÀY TẠO</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead><tbody>{users.map((user)=><tr key={user._id}><td><div className="admin-account-cell"><span className="admin-avatar">{user.fullName?.trim()?.charAt(0)?.toUpperCase() || 'U'}</span><span><strong>{user.fullName}</strong><small>{user.email}</small></span></div></td><td><span className={`admin-role-badge ${user.role}`}>{roleNames[user.role]}</span></td><td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}</td><td><span className={`admin-status ${user.status}`}>{user.status === 'blocked' ? 'Đã khóa' : 'Hoạt động'}</span></td><td><button className={`admin-row-action ${user.status === 'blocked' ? 'restore' : ''}`} disabled={savingId === user._id || user.role === 'admin'} onClick={()=>onToggle(user)}>{savingId === user._id ? 'Đang lưu…' : user.status === 'blocked' ? 'Mở khóa' : 'Tạm khóa'}</button></td></tr>)}{users.length===0&&<tr><td className="admin-empty-cell" colSpan={5}>{emptyMessage}</td></tr>}</tbody></table></div>;
}
