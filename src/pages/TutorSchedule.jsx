import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getTutor, updateAvailability } from '../api/tutorApi.js'
import AvailabilityGrid from '../components/AvailabilityGrid.jsx'
export default function TutorSchedule(){
 const {user}=useAuth(),[availability,setAvailability]=useState([]),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[message,setMessage]=useState('')
 useEffect(()=>{let alive=true;getTutor(user.tutorId).then(t=>{if(alive)setAvailability(t.availability||[])}).catch(e=>{if(alive)setMessage(e.message)}).finally(()=>{if(alive)setLoading(false)});return()=>{alive=false}},[user.tutorId])
 async function save(){setSaving(true);setMessage('');try{await updateAvailability(user.tutorId,availability);setMessage('Đã lưu lịch rảnh thành công.')}catch(e){setMessage(e.message||'Không lưu được lịch rảnh.')}finally{setSaving(false)}}
 return <><div className="student-banner"><span className="banner-tag">Khu vực gia sư</span><h1>Lịch rảnh của tôi</h1><p>Chọn các ngày và ca bạn có thể nhận lớp. Chỉ lịch của tài khoản hiện tại được cập nhật.</p></div><section className="admin-panel"><h2>Lịch dạy trong tuần</h2>{loading?<p>Đang tải lịch…</p>:<AvailabilityGrid availability={availability} onChange={setAvailability}/ >}{message&&<p className="role-message" role="status">{message}</p>}<button className="btn-primary-custom role-save" onClick={save} disabled={loading||saving}>{saving?'Đang lưu…':'Lưu lịch rảnh'}</button></section></>
}
