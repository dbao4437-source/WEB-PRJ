import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import './login.css'
export default function Login(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 const {login}=useAuth(),navigate=useNavigate()
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setError('');setBusy(true);try{const user=await login(email,password);navigate(user.role==='admin'?'/admin/tutors':user.role==='tutor'?'/tutor/schedule':'/tutors',{replace:true})}catch(e){setError(e instanceof Error?e.message:'Đăng nhập thất bại.')}finally{setBusy(false)}}
 return <div className="login-container"><section className="login-card"><div className="login-left"><div><div className="brand-logo"><div className="logo-box">T</div><span className="brand-name">TutorCenter</span></div><div className="badge">⭐ Cổng thông tin gia sư</div><h1>Chào mừng bạn <span>quay trở lại</span></h1><p>Đăng nhập để quản lý lịch dạy hoặc thông tin gia sư.</p></div><div className="feature-list"><div className="feature-item"><span className="check-icon">✓</span>Quản lý lịch dạy thuận tiện</div><div className="feature-item"><span className="check-icon">✓</span>Hồ sơ và dữ liệu được cập nhật</div></div></div><div className="login-right"><div className="form-header"><h2>Đăng nhập</h2><Link to="/tutors" className="back-link">Xem gia sư</Link></div>{error&&<div className="error-message" role="alert">{error}</div>}<form onSubmit={submit}><div className="form-group"><label>Email</label><input className="form-input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@example.com"/></div><div className="form-group"><label>Mật khẩu</label><input className="form-input" type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Nhập mật khẩu"/></div><button className="btn-submit" disabled={busy}>{busy?'Đang đăng nhập…':'Đăng nhập'}</button></form></div></section></div>
}

