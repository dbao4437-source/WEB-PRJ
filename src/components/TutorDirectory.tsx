import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { BookOpen, CalendarDays, MapPin, Search, Star, X } from 'lucide-react'
import { api } from '../services/api'
import { useTutorStore } from '../store/tutorStore'
import type { Slot, Tutor } from '../types'

const days = ['Chủ Nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7']
const dayLabel = (day: number) => days[day] ?? `Thứ ${day}`

function BookingDialog({ tutor, onClose }: { tutor: Tutor; onClose: () => void }) {
  const [slot, setSlot] = useState<Slot | null>(null)
  const [form, setForm] = useState<{ subject: string; grade: string; teachingMode: string; note: string }>({ subject: tutor.subjectsTaught[0] ?? '', grade: tutor.gradeLevels[0] ?? '', teachingMode: tutor.teachingModes[0] ?? 'online', note: '' })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const available = tutor.weeklyAvailability.filter((item) => !item.isBooked)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const studentId = localStorage.getItem('userId')
    if (!studentId) { setMessage('Bạn cần đăng nhập để gửi yêu cầu học.'); return }
    if (!slot) { setMessage('Vui lòng chọn một khung giờ còn trống.'); return }
    setBusy(true); setMessage('')
    try {
      await api.createBooking({ tutorId: tutor._id, studentId, ...form, dayOfWeek: slot.dayOfWeek, timeSlot: slot.timeSlot })
      setMessage('Đã gửi yêu cầu. Gia sư sẽ phản hồi sớm!')
      window.setTimeout(onClose, 1200)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không gửi được yêu cầu.') }
    finally { setBusy(false) }
  }
  return <div className="tc-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="tc-dialog" onSubmit={submit}>
    <button className="tc-close" type="button" onClick={onClose} aria-label="Đóng"><X size={20}/></button><span className="banner-tag"><CalendarDays size={14}/> Đăng ký học 1 kèm 1</span><h2>Học cùng {tutor.fullName}</h2>
    <label>Môn học<select required value={form.subject} onChange={(e) => setForm({...form, subject:e.target.value})}>{tutor.subjectsTaught.map((x)=><option key={x}>{x}</option>)}</select></label>
    <label>Cấp lớp<select required value={form.grade} onChange={(e) => setForm({...form, grade:e.target.value})}>{tutor.gradeLevels.map((x)=><option key={x}>{x}</option>)}</select></label>
    <label>Hình thức<select value={form.teachingMode} onChange={(e) => setForm({...form, teachingMode:e.target.value})}>{tutor.teachingModes.map((x)=><option key={x} value={x}>{x==='online'?'Online':'Offline'}</option>)}</select></label>
    <fieldset><legend>Chọn khung giờ trống</legend><div className="tc-slot-list">{available.map((item)=><button type="button" key={`${item.dayOfWeek}-${item.timeSlot}`} className={`tc-slot ${slot===item?'selected':''}`} onClick={()=>setSlot(item)}>{dayLabel(item.dayOfWeek)} · {item.timeSlot}</button>)}{!available.length&&<p>Gia sư chưa cập nhật lịch trống.</p>}</div></fieldset>
    <label>Ghi chú<textarea rows={3} value={form.note} onChange={(e)=>setForm({...form,note:e.target.value})} placeholder="Mục tiêu học tập hoặc điều bạn muốn gia sư lưu ý"/></label>
    {message&&<p className="tc-feedback" role="status">{message}</p>}<button className="btn-primary-custom" disabled={busy}>{busy?'Đang gửi…':'Gửi yêu cầu học'}</button>
  </form></div>
}

export default function TutorDirectory() {
  const { filters, tutors, loading, error, setFilter, resetFilters, loadTutors } = useTutorStore()
  const [selected, setSelected] = useState<Tutor|null>(null)
  useEffect(()=>{ void loadTutors() }, [filters, loadTutors])
  const field=(key: keyof typeof filters, value:string)=>setFilter(key,value)
  return <>
    <div className="student-banner"><span className="banner-tag"><Search size={14}/> Đội ngũ gia sư chất lượng</span><h1>Tìm gia sư phù hợp với bạn</h1><p>Lọc theo môn học, cấp lớp, ngân sách và thời gian trống. Gửi yêu cầu học 1 kèm 1 chỉ với vài bước.</p></div>
    <section className="tutor-filter-bar" aria-label="Bộ lọc gia sư"><div className="search-input-wrapper"><Search size={17} className="search-icon-abs"/><input value={filters.search} onChange={(e)=>field('search',e.target.value)} placeholder="Tên gia sư hoặc môn học"/></div>
      <select className="filter-select" value={filters.subject} onChange={(e)=>field('subject',e.target.value)}><option value="">Tất cả môn</option>{['Toán','Vật lý','Hóa học','Tiếng Anh','Ngữ văn'].map(x=><option key={x}>{x}</option>)}</select>
      <select className="filter-select" value={filters.grade} onChange={(e)=>field('grade',e.target.value)}><option value="">Tất cả cấp lớp</option>{['Tiểu học','THCS','THPT','Luyện thi'].map(x=><option key={x}>{x}</option>)}</select>
      <input className="filter-input" type="number" min="0" placeholder="Phí từ" value={filters.minFee} onChange={(e)=>field('minFee',e.target.value)}/><input className="filter-input" type="number" min="0" placeholder="Phí đến" value={filters.maxFee} onChange={(e)=>field('maxFee',e.target.value)}/>
      <input className="filter-input" placeholder="Khu vực" value={filters.location} onChange={(e)=>field('location',e.target.value)}/><select className="filter-select" value={filters.teachingMode} onChange={(e)=>field('teachingMode',e.target.value)}><option value="">Online & Offline</option><option value="online">Online</option><option value="offline">Offline</option></select>
      <select className="filter-select" value={filters.dayOfWeek} onChange={(e)=>field('dayOfWeek',e.target.value)}><option value="">Mọi ngày</option>{days.map((x,i)=><option value={i} key={x}>{x}</option>)}</select><select className="filter-select" value={filters.timeSlot} onChange={(e)=>field('timeSlot',e.target.value)}><option value="">Mọi ca</option>{['Sáng','Chiều','Tối'].map(x=><option key={x}>{x}</option>)}</select>
      <button className="btn-outline-custom tc-reset" onClick={resetFilters}>Đặt lại bộ lọc</button></section>
    {error&&<div className="tc-notice error">{error} <button className="btn-outline-custom" onClick={()=>void loadTutors()}>Thử lại</button></div>}
    <div className="tc-results-head"><strong>{loading?'Đang tìm gia sư…':`${tutors.length} gia sư phù hợp`}</strong><span>Chọn một hồ sơ để xem lịch và đăng ký</span></div>
    <div className="tc-tutor-grid">{tutors.map((tutor)=><article className="tc-tutor-card" key={tutor._id}><div className="tc-tutor-top"><img src={tutor.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.fullName)}&background=FEF08A&color=713F12`} alt=""/><div><h2>{tutor.fullName}</h2><span><Star size={14} fill="currentColor"/> {tutor.rating?.toFixed(1)??'Mới'}</span></div></div><p className="tc-bio">{tutor.bio||'Gia sư sẵn sàng đồng hành cùng lộ trình học tập của bạn.'}</p><div className="tutor-tags-row">{tutor.subjectsTaught.map(x=><span className="tag-yellow" key={x}><BookOpen size={12}/>{x}</span>)}</div><div className="tc-meta"><span><MapPin size={14}/>{tutor.location||'Toàn quốc'}</span><span>{tutor.teachingModes.map(x=>x==='online'?'Online':'Offline').join(' · ')}</span></div><strong className="price-text">{new Intl.NumberFormat('vi-VN').format(tutor.hourlyRate)} ₫ <small>/ giờ</small></strong><div className="tc-slots">{tutor.weeklyAvailability.filter(x=>!x.isBooked).slice(0,4).map(x=><span key={`${x.dayOfWeek}-${x.timeSlot}`}>{dayLabel(x.dayOfWeek)} · {x.timeSlot}</span>)}{!tutor.weeklyAvailability.some(x=>!x.isBooked)&&<span>Đang cập nhật lịch</span>}</div><button className="btn-primary-custom" onClick={()=>setSelected(tutor)}>Đăng ký học</button></article>)}</div>
    {!loading&&!tutors.length&&!error&&<div className="tc-empty">Chưa tìm thấy gia sư phù hợp. Hãy thử thay đổi bộ lọc.</div>}
    {selected&&<BookingDialog tutor={selected} onClose={()=>setSelected(null)}/>}
  </>
}
