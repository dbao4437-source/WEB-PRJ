import { useState } from 'react'
import { LogIn, UserPlus, Shield, GraduationCap, User, CheckCircle2, Lock, Mail, Phone } from 'lucide-react'

export default function AuthModal({ isOpen, onClose, initialTab = 'login', onLoginSuccess }) {
  const [tab, setTab] = useState(initialTab) // 'login' | 'register'
  const [role, setRole] = useState('tutor') // 'student' | 'tutor' | 'admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!isOpen) return null

  // Đăng nhập nhanh tài khoản mẫu
  const handleQuickLogin = (demoUser) => {
    onLoginSuccess(demoUser)
    setSuccessMsg(`Đăng nhập thành công với vai trò: ${demoUser.roleName}`)
    setTimeout(() => {
      setSuccessMsg('')
      onClose()
    }, 900)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const userObj = {
      fullName: fullName.trim() || (role === 'admin' ? 'Quản trị viên HSA' : role === 'tutor' ? 'Thầy Kevin Nguyễn' : 'Nguyễn Văn Học'),
      email: email.trim() || `${role}@hsa.edu.vn`,
      role,
      roleName: role === 'admin' ? 'Quản trị viên (Admin)' : role === 'tutor' ? 'Gia sư (Tutor)' : 'Học viên (Student)',
      avatar: role === 'tutor'
        ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'
        : role === 'admin'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    }

    onLoginSuccess(userObj)
    setSuccessMsg(`✓ ${tab === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'} thành công!`)
    setTimeout(() => {
      setSuccessMsg('')
      onClose()
    }, 900)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box auth-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <div className="auth-brand">
            <span className="brand-mark" style={{ width: '32px', height: '32px', fontSize: '18px' }}>H</span>
            <span>HSA Education · Xác thực tài khoản</span>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Tabs: Đăng nhập / Đăng ký */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            <LogIn size={16} /> Đăng nhập
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            <UserPlus size={16} /> Đăng ký
          </button>
        </div>

        {successMsg ? (
          <div className="modal-body success-state" style={{ padding: '36px 20px' }}>
            <CheckCircle2 size={54} color="#07996e" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ margin: '0 0 8px', color: '#166534' }}>{successMsg}</h3>
            <p style={{ color: '#64748b', fontSize: '13px' }}>Đang đồng bộ quyền hạn vào hệ thống...</p>
          </div>
        ) : (
          <div className="auth-modal-body">
            {/* Chọn vai trò người dùng (Yêu cầu Người A & B) */}
            <div className="role-selector-box">
              <label className="auth-field-label">Chọn vai trò đăng nhập:</label>
              <div className="role-pills">
                <button
                  type="button"
                  className={`role-pill ${role === 'student' ? 'active' : ''}`}
                  onClick={() => setRole('student')}
                >
                  <User size={15} /> Học viên
                </button>
                <button
                  type="button"
                  className={`role-pill ${role === 'tutor' ? 'active' : ''}`}
                  onClick={() => setRole('tutor')}
                >
                  <GraduationCap size={15} /> Gia sư
                </button>
                <button
                  type="button"
                  className={`role-pill ${role === 'admin' ? 'active' : ''}`}
                  onClick={() => setRole('admin')}
                >
                  <Shield size={15} /> Admin
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {tab === 'register' && (
                <>
                  <div className="auth-input-group">
                    <label>Họ và tên *</label>
                    <div className="input-with-icon">
                      <User size={16} className="input-icon" />
                      <input
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label>Số điện thoại</label>
                    <div className="input-with-icon">
                      <Phone size={16} className="input-icon" />
                      <input
                        type="tel"
                        placeholder="0988 xxx xxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="auth-input-group">
                <label>Email đăng nhập *</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    required
                    placeholder={role === 'tutor' ? 'kevin.math@hsa.edu.vn' : role === 'admin' ? 'admin@hsa.edu.vn' : 'hocvien@gmail.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Mật khẩu *</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn">
                {tab === 'login' ? 'Đăng nhập ngay' : 'Đăng ký tài khoản'}
              </button>
            </form>

            {/* Tài khoản demo nhanh cho giảng viên chấm BTL */}
            <div className="demo-accounts-box">
              <div className="demo-accounts-title">⚡ Đăng nhập nhanh để test quyền:</div>
              <div className="demo-btn-group">
                <button
                  type="button"
                  className="demo-chip tutor-chip"
                  onClick={() =>
                    handleQuickLogin({
                      fullName: 'Thầy Kevin Nguyễn',
                      email: 'kevin.math@hsa.edu.vn',
                      role: 'tutor',
                      roleName: 'Gia sư',
                      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
                    })
                  }
                >
                  👨‍🏫 Gia sư (Thầy Kevin)
                </button>
                <button
                  type="button"
                  className="demo-chip admin-chip"
                  onClick={() =>
                    handleQuickLogin({
                      fullName: 'Quản trị viên HSA',
                      email: 'admin@hsa.edu.vn',
                      role: 'admin',
                      roleName: 'Admin',
                      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                    })
                  }
                >
                  🛡️ Admin
                </button>
                <button
                  type="button"
                  className="demo-chip student-chip"
                  onClick={() =>
                    handleQuickLogin({
                      fullName: 'Trần Minh Hải',
                      email: 'minhhai@student.ptit.edu.vn',
                      role: 'student',
                      roleName: 'Học viên',
                      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
                    })
                  }
                >
                  🎓 Học viên
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
