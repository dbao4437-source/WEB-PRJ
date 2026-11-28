import { useEffect, useMemo, useState } from 'react'
import { AREA_OPTIONS, CERTIFICATE_OPTIONS, LEVEL_OPTIONS, SUBJECT_OPTIONS } from '../../constants/options.js'
import { getMyTutorProfile, updateMyTutorProfile } from '../api/tutorApi.js'
import ImageUploader from '../components/shared/ImageUploader.jsx'
import MultiChipSelect from '../components/shared/MultiChipSelect.jsx'
import MoneyInput from '../components/shared/MoneyInput.jsx'
import SearchableSelect from '../components/shared/SearchableSelect.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const emptyForm = { name:'', avatar:'', subjects:[], levels:[], areas:[], mode:'Cả hai', experienceYears:'', education:'', major:'', certificates:[], bio:'', phone:'', contactEmail:'' }
const cleanPhone = value => value.replace(/[\s.\-()]/g, '')
function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Vui lòng nhập họ tên.'
  if (!form.subjects.length || form.subjects.length > 5) errors.subjects = 'Chọn từ 1 đến 5 môn dạy.'
  if (!form.levels.length) errors.levels = 'Chọn ít nhất một cấp lớp.'
  if (!form.areas.length) errors.areas = 'Chọn ít nhất một khu vực.'
  if (!form.education.trim()) errors.education = 'Chọn hoặc nhập học vấn.'
  if (!/^(?:0(?:3|5|7|8|9)\d{8}|\+84(?:3|5|7|8|9)\d{8})$/.test(cleanPhone(form.phone))) errors.phone = 'Nhập số Việt Nam hợp lệ, ví dụ 0987654321 hoặc +84987654321.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) errors.contactEmail = 'Email liên hệ không đúng định dạng.'
  return errors
}
export default function TutorAccount() {
  const { updateUser } = useAuth()
  const [tutor, setTutor] = useState(null)
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    getMyTutorProfile().then(data => {
      if (!active) return
      const next = { ...emptyForm, name:data.name||'', avatar:data.avatar||'', subjects:data.subjects||[], levels:data.levels||[], areas:data.areas||[], mode:data.mode||'Cả hai', experienceYears:String(data.experienceYears ?? 0), education:data.education||'', major:data.major||'', certificates:data.certificates||[], bio:data.bio||'', phone:data.phone||'', contactEmail:data.contactEmail||'' }
      setTutor(data); setForm(next); setSaved(JSON.stringify(next))
    }).catch(error => { if (active) setMessage(error.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const dirty = useMemo(() => Boolean(form && saved && JSON.stringify(form) !== saved), [form, saved])
  useEffect(() => {
    if (!dirty) return
    const beforeUnload = event => { event.preventDefault(); event.returnValue = '' }
    const confirmLink = event => { const link = event.target.closest?.('a[href]'); if (!link || !link.href.startsWith(window.location.origin) || link.pathname === window.location.pathname) return; if (!window.confirm('Bạn có thay đổi chưa lưu. Rời trang và bỏ thay đổi?')) { event.preventDefault(); event.stopPropagation() } }
    window.addEventListener('beforeunload', beforeUnload); document.addEventListener('click', confirmLink, true)
    return () => { window.removeEventListener('beforeunload', beforeUnload); document.removeEventListener('click', confirmLink, true) }
  }, [dirty])
  const field = (key, value) => setForm(current => ({ ...current, [key]: value }))
  async function saveProfile(event) {
    event.preventDefault(); const found = validate(form); setErrors(found); if (Object.keys(found).length) return
    setSaving(true); setMessage('')
    try {
      const payload = { name:form.name, avatar:form.avatar, subjects:form.subjects, levels:form.levels, areas:form.areas, mode:form.mode, experienceYears:Number(form.experienceYears)||0, education:form.education, major:form.major, certificates:form.certificates, bio:form.bio, phone:cleanPhone(form.phone), contactEmail:form.contactEmail.trim() }
      const updated = await updateMyTutorProfile(payload)
      const next = { ...form, name:updated.name, avatar:updated.avatar||'', phone:updated.phone, contactEmail:updated.contactEmail }
      setTutor(updated); setForm(next); setSaved(JSON.stringify(next)); updateUser({ name:updated.name, avatar:updated.avatar||'' }); setMessage('Đã lưu thông tin tài khoản thành công.')
    } catch (error) { setMessage(error.message||'Không lưu được hồ sơ.') } finally { setSaving(false) }
  }
  if (loading) return <div className="tc-empty">Đang tải tài khoản…</div>
  if (!form || !tutor) return <section className="admin-panel"><h1>Không tải được tài khoản gia sư</h1><p className="role-message error">{message}</p></section>
  return <div className="tutor-account-page"><div className="student-banner"><span className="banner-tag">Khu vực gia sư</span><h1>Tài khoản của tôi</h1><p>Cập nhật thông tin chuyên môn hiển thị trên hồ sơ gia sư.</p></div>
    <form className="admin-panel account-editor" onSubmit={saveProfile} noValidate><h2>Thông tin hồ sơ</h2><div className="role-form-grid">
      <label>Họ và tên<input value={form.name} onChange={event=>field('name',event.target.value)}/>{errors.name&&<small className="field-error">{errors.name}</small>}</label>
      <ImageUploader name={form.name} value={form.avatar} onChange={value=>field('avatar',value)}/>
      <MultiChipSelect label="Môn dạy (chọn 1–5 môn)" options={SUBJECT_OPTIONS} value={form.subjects} onChange={value=>field('subjects',value)} min={1} max={5} error={errors.subjects}/>
      <MultiChipSelect label="Cấp lớp" options={LEVEL_OPTIONS} value={form.levels} onChange={value=>field('levels',value)} min={1} error={errors.levels}/>
      <div><MoneyInput value={tutor.fee} disabled/><small>Học phí do quản trị viên quy định. Liên hệ admin nếu cần thay đổi</small></div>
      <MultiChipSelect label="Khu vực dạy" options={AREA_OPTIONS} value={form.areas} onChange={value=>field('areas',value)} min={1} error={errors.areas}/>
      <label>Hình thức dạy<select value={form.mode} onChange={event=>field('mode',event.target.value)}><option>Cả hai</option><option>Online</option><option>Offline</option></select></label>
      <label>Số năm kinh nghiệm<input type="number" min="0" value={form.experienceYears} onChange={event=>field('experienceYears',event.target.value)}/></label>
      <label>Số điện thoại<input value={form.phone} onChange={event=>field('phone',event.target.value.replace(/[.\-\s()]/g,''))} placeholder="0987654321"/>{errors.phone&&<small className="field-error">{errors.phone}</small>}</label>
      <label>Email liên hệ<input type="email" value={form.contactEmail} onChange={event=>field('contactEmail',event.target.value)}/>{errors.contactEmail&&<small className="field-error">{errors.contactEmail}</small>}</label>
      <div className="school-and-major"><SearchableSelect value={form.education} onChange={value=>field('education',value)} error={errors.education}/><label className="shared-field"><span className="shared-label">Chuyên ngành</span><input className="shared-input" value={form.major} onChange={event=>field('major',event.target.value)} placeholder="Nhập chuyên ngành"/></label></div>
      <MultiChipSelect label="Chứng chỉ" options={CERTIFICATE_OPTIONS} value={form.certificates} onChange={value=>field('certificates',value)} allowCustom/>
      <label className="role-form-wide">Giới thiệu<textarea rows="4" value={form.bio} onChange={event=>field('bio',event.target.value)}/></label>
    </div>{message&&<p className={`role-message ${message.startsWith('Đã lưu')?'':'error'}`} role="status">{message}</p>}<button className="btn-primary-custom account-save" disabled={saving}>{saving?'Đang lưu…':'Lưu thông tin'}</button>
    <p className="account-password-note">Cần đổi mật khẩu? Vui lòng liên hệ quản trị viên.</p></form>
  </div>
}
