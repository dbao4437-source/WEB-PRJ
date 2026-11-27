import { ArrowUpRight, ClipboardList, History, ShieldAlert } from 'lucide-react';
import type { AdminAlert, AdminAuditEntry, AdminEnrollment, AdminTutor } from './AdminDashboard';

type Upcoming = { enrollment: AdminEnrollment; lessonDate: string };
type Completed = { enrollment: AdminEnrollment; session: AdminEnrollment['sessions'][number] };
type AdminUser = { _id: string; fullName: string; email: string; phone?: string; role: 'student' | 'tutor' | 'admin'; status: 'active' | 'blocked'; createdAt: string };

export function SessionPanel({ upcoming, completed }: { upcoming: Upcoming[]; completed: Completed[] }) {
  return <div className="admin-session-panels">
    <section className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">LỊCH 14 NGÀY TỚI</span><h3>Buổi học sắp diễn ra</h3><p>Lịch lấy từ thời khóa biểu lớp trong MongoDB.</p></div><span className="admin-count-pill">{upcoming.length} buổi</span></div>
      {upcoming.length ? <div className="admin-session-list">{upcoming.map(({ enrollment, lessonDate }) => <SessionRow key={`${enrollment._id}-${lessonDate}`} enrollment={enrollment} lessonDate={lessonDate} upcoming/>)}</div> : <EmptyState title="Chưa có buổi học sắp tới" detail="Kiểm tra thời hạn và lịch của các lớp đang hoạt động."/>}
    </section>
    <section className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">LỊCH SỬ</span><h3>Buổi học đã hoàn thành</h3><p>Buổi học và đánh giá được gia sư ghi nhận.</p></div><span className="admin-count-pill">{completed.length} buổi</span></div>
      {completed.length ? <div className="admin-session-list">{completed.slice(0, 60).map(({ enrollment, session }) => <SessionRow key={`${enrollment._id}-${session.lessonDate}`} enrollment={enrollment} lessonDate={session.lessonDate} session={session}/>)}</div> : <EmptyState title="Chưa có buổi hoàn thành" detail="Buổi học sẽ xuất hiện sau khi gia sư xác nhận hoàn thành."/>}
    </section>
  </div>;
}

function SessionRow({ enrollment, lessonDate, upcoming, session }: { enrollment: AdminEnrollment; lessonDate: string; upcoming?: boolean; session?: AdminEnrollment['sessions'][number] }) {
  const date = new Date(`${lessonDate}T12:00:00`);
  return <article className="admin-session-row"><div className="admin-session-date"><strong>{date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</strong><small>{date.toLocaleDateString('vi-VN', { weekday: 'short' })}</small></div><div className="admin-session-info"><strong>{enrollment.subject} · {enrollment.className}</strong><span>{enrollment.studentName} học với {enrollment.tutorName}</span><small>{enrollment.startTime || 'Chưa xếp giờ'} · {enrollment.durationMinutes || 90} phút</small></div><div className="admin-session-state">{upcoming ? enrollment.meetingLink ? <a href={enrollment.meetingLink} target="_blank" rel="noreferrer">Mở phòng học ↗</a> : <span className="admin-state-warning">Thiếu link phòng</span> : <><span className="admin-state-done">Đã hoàn thành</span>{session?.rating ? <small>{session.rating}/5 sao</small> : null}</>}</div></article>;
}

export function TutorPanel({ tutors, savingId, onToggle }: { tutors: AdminTutor[]; savingId: string; onToggle: (user: AdminUser) => void }) {
  return <section className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">HỒ SƠ &amp; HOẠT ĐỘNG</span><h3>Danh sách gia sư</h3><p>Hồ sơ, môn dạy và lớp đang phụ trách từ MongoDB.</p></div><span className="admin-count-pill">{tutors.length} gia sư</span></div>
    {tutors.length ? <div className="admin-tutor-list">{tutors.map((tutor) => <article className="admin-tutor-row" key={tutor._id}><div className="admin-avatar">{tutor.fullName.trim().charAt(0).toLocaleUpperCase('vi-VN') || 'G'}</div><div className="admin-tutor-info"><strong>{tutor.fullName}</strong><span>{tutor.title || tutor.major || 'Chưa bổ sung chức danh'}{tutor.institution ? ` · ${tutor.institution}` : ''}</span><small>{tutor.email} · {tutor.phone || 'Chưa có số điện thoại'}</small><div className="admin-tutor-subjects">{tutor.subjects.length ? tutor.subjects.map((subject) => <span key={subject}>{subject}</span>) : <span>Chưa cập nhật chuyên môn</span>}</div></div><div className="admin-tutor-stats"><strong>{tutor.classCount}</strong><small>lớp đang dạy</small><strong>{tutor.pendingCount}</strong><small>yêu cầu chờ</small></div><div className="admin-tutor-actions"><span className={`admin-status ${tutor.status}`}>{tutor.status === 'active' ? 'Hoạt động' : 'Đã khóa'}</span><button className={`admin-row-action ${tutor.status === 'blocked' ? 'restore' : ''}`} disabled={savingId === tutor._id} onClick={() => onToggle({ _id: tutor._id, fullName: tutor.fullName, email: tutor.email, phone: tutor.phone, role: 'tutor', status: tutor.status, createdAt: '' })}>{savingId === tutor._id ? 'Đang lưu…' : tutor.status === 'blocked' ? 'Mở khóa' : 'Tạm khóa'}</button></div></article>)}</div> : <EmptyState title="Chưa có tài khoản gia sư" detail="Gia sư sẽ xuất hiện sau khi đăng ký tài khoản."/>}
  </section>;
}

export function AlertPanel({ alerts, enrollments, savingId, onDecide, onOpenClass }: { alerts: AdminAlert[]; enrollments: AdminEnrollment[]; savingId: string; onDecide: (enrollment: AdminEnrollment, status: 'active' | 'rejected') => void; onOpenClass: (studentId: string) => void }) {
  return <section className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">CẦN QUẢN TRỊ VIÊN XỬ LÝ</span><h3>Cảnh báo hệ thống</h3><p>Yêu cầu chờ duyệt, lớp thiếu link phòng hoặc đang thiếu lịch.</p></div><span className="admin-count-pill warning">{alerts.length} mục</span></div>
    {alerts.length ? <div className="admin-alert-list">{alerts.map((alert) => {
      const enrollment = enrollments.find((item) => item._id === alert.enrollmentId);
      return <article className="admin-alert-item" key={alert.id}><span className={`admin-alert-icon ${alert.type}`}><ShieldAlert size={17}/></span><div className="admin-alert-copy"><strong>{alert.title}</strong><small>{alert.detail}</small></div>{alert.type === 'pending' && enrollment ? <div className="admin-alert-actions"><button className="admin-approve-button" disabled={savingId === enrollment._id} onClick={() => onDecide(enrollment, 'active')}>Duyệt</button><button className="admin-reject-button" disabled={savingId === enrollment._id} onClick={() => onDecide(enrollment, 'rejected')}>Từ chối</button></div> : <button className="admin-text-button" onClick={() => onOpenClass(alert.studentId)}>Mở lớp <ArrowUpRight size={14}/></button>}</article>;
    })}</div> : <EmptyState title="Không có cảnh báo cần xử lý" detail="Các yêu cầu và lớp học hiện đã đủ thông tin."/>}
  </section>;
}

export function ActivityPanel({ entries }: { entries: AdminAuditEntry[] }) {
  return <section className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">NHẬT KÝ MONGODB</span><h3>Lịch sử thao tác quản trị</h3><p>Người thực hiện, nội dung và thời điểm thay đổi.</p></div><span className="admin-count-pill">{entries.length} thao tác</span></div>
    {entries.length ? <div className="admin-activity-list">{entries.map((entry) => <article className="admin-activity-row" key={entry._id}><span className="admin-activity-mark"><History size={16}/></span><div><strong>{entry.details}</strong><span>{entry.targetLabel} · {entry.actorName}</span><small>{new Date(entry.createdAt).toLocaleString('vi-VN')}</small></div></article>)}</div> : <EmptyState title="Chưa có lịch sử thao tác" detail="Các thay đổi của admin sẽ được lưu lại tại đây."/>}
  </section>;
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="admin-class-empty"><ClipboardList size={24}/><strong>{title}</strong><span>{detail}</span></div>;
}
