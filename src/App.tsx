import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { CalendarDays, ChevronDown, LogOut, Search, Settings, UserRound } from 'lucide-react'
import Login from './login'
import Register from './register'
import BookingManager from './components/BookingManager'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import TutorList from './pages/TutorList.jsx'
import TutorProfile from './pages/TutorProfile.jsx'
import TutorSchedule from './pages/TutorSchedule.jsx'
import TutorAccount from './pages/TutorAccount.jsx'
import AdminTutors from './pages/AdminTutors.jsx'
import { avatarUrl } from './utils/avatarUrl.js'
import './App.css'

function Workspace({children}:{children:ReactNode}){
 const {user,logout}=useAuth(),navigate=useNavigate(),[menuOpen,setMenuOpen]=useState(false),menuRef=useRef<HTMLDivElement>(null)
 const role=user?.role||''
 useEffect(()=>{
  const outside=(event:PointerEvent)=>{if(menuRef.current&&!menuRef.current.contains(event.target as Node))setMenuOpen(false)}
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setMenuOpen(false)}
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape)
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)}
 },[])
 const handleLogout=()=>{setMenuOpen(false);logout();navigate('/login')}
 return <div className="student-dashboard"><header className="student-header"><Link to="/" className="student-brand"><span className="student-logo-box">T</span><span><b className="student-brand-title">Tutor<span>Center</span></b><small className="student-brand-subtitle">Hệ thống học tập thông minh</small></span></Link><nav className="student-nav-links"><Link className="nav-link-item" to="/tutors"><Search size={15}/> Tìm gia sư</Link>{user&&<Link className="nav-link-item" to="/bookings"><CalendarDays size={15}/> Yêu cầu & lịch</Link>}{role==='tutor'&&<Link className="nav-link-item" to="/tutor/schedule"><CalendarDays size={15}/> Lịch rảnh</Link>}{role==='admin'&&<Link className="nav-link-item" to="/admin/tutors"><Settings size={15}/> Quản trị</Link>}</nav><div className="student-header-actions">{user?<div className="account-menu" ref={menuRef}><button className="account-menu-trigger" aria-expanded={menuOpen} aria-haspopup="menu" onClick={()=>setMenuOpen(open=>!open)}>{user.avatar?<img src={avatarUrl(user.avatar)} alt=""/>:<span className="account-initial">{user.name?.charAt(0)||'T'}</span>}<span className="account-trigger-copy"><strong>{user.name}</strong><small>{role==='admin'?'Quản trị viên':role==='tutor'?'Gia sư':'Học viên'}</small></span><ChevronDown size={15}/></button>{menuOpen&&<div className="account-menu-popover" role="menu"><Link role="menuitem" to={role==='tutor'?'/tutor/account':'/admin/tutors'} onClick={()=>setMenuOpen(false)}><UserRound size={15}/>{role==='tutor'?'Tài khoản của tôi':'Quản trị'}</Link>{role==='tutor'&&<Link role="menuitem" to="/tutor/schedule" onClick={()=>setMenuOpen(false)}><CalendarDays size={15}/>Lịch rảnh</Link>}<button role="menuitem" onClick={handleLogout}><LogOut size={15}/>Đăng xuất</button></div>}</div>:<Link className="logout-btn" to="/login">Đăng nhập</Link>}</div></header><main className="student-container">{children}</main></div>
}
function Home(){return <div className="login-container"><section className="login-card"><div className="login-left"><h1>Kết nối học viên với <span>gia sư phù hợp</span></h1><p>Tìm kiếm gia sư theo môn học, khung giờ và ngân sách.</p></div><div className="login-right"><h2>Bắt đầu học tập</h2><p className="tc-home-copy">Đăng nhập để quản lý hoặc tiếp tục xem hồ sơ gia sư.</p><Link className="btn-primary-custom" to="/login">Đăng nhập</Link><Link className="btn-outline-custom tc-home-button" to="/tutors">Tiếp tục xem gia sư</Link></div></section></div>}
function RoleRedirect(){const {user}=useAuth();return <Navigate replace to={user?.role==='admin'?'/admin/tutors':user?.role==='tutor'?'/tutor/schedule':'/tutors'}/>}
export default function App(){return <BrowserRouter><AuthProvider><Routes><Route path="/" element={<Home/>}/><Route path="/tutors" element={<Workspace><TutorList/></Workspace>}/><Route path="/tutors/:id" element={<Workspace><TutorProfile/></Workspace>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/tutor/schedule" element={<ProtectedRoute roles={['tutor']}><Workspace><TutorSchedule/></Workspace></ProtectedRoute>}/><Route path="/tutor/account" element={<ProtectedRoute roles={['tutor']}><Workspace><TutorAccount/></Workspace></ProtectedRoute>}/><Route path="/admin/tutors" element={<ProtectedRoute roles={['admin']}><Workspace><AdminTutors/></Workspace></ProtectedRoute>}/><Route path="/bookings" element={<Workspace><BookingManager/></Workspace>}/><Route path="*" element={<RoleRedirect/>}/></Routes></AuthProvider></BrowserRouter>}


