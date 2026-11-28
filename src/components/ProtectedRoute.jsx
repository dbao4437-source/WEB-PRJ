import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
export default function ProtectedRoute({roles,children}){
 const {user}=useAuth()
 if(!user)return <Navigate to="/login" replace/>
 if(roles&&!roles.includes(user.role))return <main className="student-container"><section className="tc-empty"><h1>403 – Bạn không có quyền</h1><p>Tài khoản hiện tại không được phép truy cập trang này.</p></section></main>
 return children||<Outlet/>
}
