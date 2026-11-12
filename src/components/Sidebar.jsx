import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  Compass,
  BookOpen,
  Layers,
  Award,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  UserPlus,
  ChevronUp,
  GraduationCap,
  Sparkles,
  ChevronDown
} from 'lucide-react'

export default function Sidebar({ currentUser, onOpenAuth, onLogout, onSelectDemoUser }) {
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [roleplayOpen, setRoleplayOpen] = useState(true)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  // Đóng popover khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowAccountMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const defaultUser = {
    fullName: 'Thầy Kevin Nguyễn',
    email: 'kevin.math@hsa.edu.vn',
    role: 'tutor',
    roleName: 'Gia sư Toán THPT',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
  }

  const activeUser = currentUser || defaultUser

  return (
    <aside className="dashboard-sidebar">
      {/* Brand / Logo */}
      <div className="sidebar-brand-wrapper">
        <Link to="/" className="sidebar-brand">
          <span className="brand-logo-icon">
            <GraduationCap size={22} color="#fff" />
          </span>
          <div className="brand-title-group">
            <span className="brand-name">HSA Education</span>
            <span className="brand-badge">PRO</span>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav-container">
        {/* Section 1: GENERAL */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">DANH MỤC CHÍNH</div>
          <nav className="sidebar-menu">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Compass size={18} className="link-icon" />
              <span>Khám phá lớp (Màn 3)</span>
            </NavLink>

            <NavLink
              to="/classes/class-1"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <BookOpen size={18} className="link-icon" />
              <span>Chi tiết lớp mẫu (Màn 4)</span>
            </NavLink>

            {/* Accordion Quản lý lớp */}
            <div className="sidebar-accordion">
              <button
                type="button"
                className="sidebar-link accordion-toggle"
                onClick={() => setRoleplayOpen(!roleplayOpen)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layers size={18} className="link-icon" />
                  <span>Quản lý lớp học</span>
                </div>
                {roleplayOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {roleplayOpen && (
                <div className="accordion-submenu">
                  <NavLink
                    to="/manage-classes"
                    className={({ isActive }) => `submenu-link ${isActive ? 'active' : ''}`}
                  >
                    <span>Bảng điều phối lớp (Gia sư/Admin)</span>
                  </NavLink>
                  <a
                    href="#stats"
                    className="submenu-link"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/manage-classes')
                    }}
                  >
                    <span>Thống kê sĩ số học viên</span>
                  </a>
                  <a
                    href="#history"
                    className="submenu-link"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/manage-classes')
                    }}
                  >
                    <span>Lịch sử đăng ký lớp</span>
                  </a>
                </div>
              )}
            </div>

            <a href="#test" className="sidebar-link" onClick={(e) => e.preventDefault()}>
              <FileText size={18} className="link-icon" />
              <span>Đề thi thử HSA / ĐGNL</span>
            </a>

            <a href="#achievement" className="sidebar-link" onClick={(e) => e.preventDefault()}>
              <Award size={18} className="link-icon" />
              <span>Thành tích & Chứng chỉ</span>
            </a>
          </nav>
        </div>

        {/* Section 2: OTHERS */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">HỆ THỐNG</div>
          <nav className="sidebar-menu">
            <a href="#settings" className="sidebar-link" onClick={(e) => e.preventDefault()}>
              <Settings size={18} className="link-icon" />
              <span>Cài đặt tài khoản</span>
            </a>
            <a href="#help" className="sidebar-link" onClick={(e) => e.preventDefault()}>
              <HelpCircle size={18} className="link-icon" />
              <span>Trợ giúp & Hỗ trợ</span>
            </a>
          </nav>
        </div>
      </div>

      {/* User Profile Card & Account Switcher Popover (Theo đúng ảnh mẫu) */}
      <div className="sidebar-footer" ref={menuRef}>
        {showAccountMenu && (
          <div className="account-popover">
            <div className="popover-header">CHUYỂN ĐỔI TÀI KHOẢN (TEST QUYỀN)</div>

            <div
              className={`popover-account-item ${activeUser.role === 'tutor' ? 'active' : ''}`}
              onClick={() => {
                onSelectDemoUser({
                  fullName: 'Thầy Kevin Nguyễn',
                  email: 'kevin.math@hsa.edu.vn',
                  role: 'tutor',
                  roleName: 'Gia sư Toán',
                  avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
                })
                setShowAccountMenu(false)
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
                alt="Kevin"
                className="popover-avatar"
              />
              <div className="popover-account-info">
                <strong>Thầy Kevin Nguyễn</strong>
                <span>kevin.math@hsa.edu.vn</span>
              </div>
              <span className="role-tag tutor">Gia sư</span>
            </div>

            <div
              className={`popover-account-item ${activeUser.role === 'admin' ? 'active' : ''}`}
              onClick={() => {
                onSelectDemoUser({
                  fullName: 'Quản trị viên HSA',
                  email: 'admin@hsa.edu.vn',
                  role: 'admin',
                  roleName: 'Quản trị viên (Admin)',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                })
                setShowAccountMenu(false)
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                alt="Admin"
                className="popover-avatar"
              />
              <div className="popover-account-info">
                <strong>Quản trị viên HSA</strong>
                <span>admin@hsa.edu.vn</span>
              </div>
              <span className="role-tag admin">Admin</span>
            </div>

            <div
              className={`popover-account-item ${activeUser.role === 'student' ? 'active' : ''}`}
              onClick={() => {
                onSelectDemoUser({
                  fullName: 'Trần Minh Hải',
                  email: 'minhhai@student.ptit.edu.vn',
                  role: 'student',
                  roleName: 'Học viên',
                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
                })
                setShowAccountMenu(false)
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
                alt="Student"
                className="popover-avatar"
              />
              <div className="popover-account-info">
                <strong>Trần Minh Hải</strong>
                <span>minhhai@student.ptit.edu.vn</span>
              </div>
              <span className="role-tag student">Học viên</span>
            </div>

            <div className="popover-actions">
              <button
                type="button"
                className="popover-btn add-btn"
                onClick={() => {
                  setShowAccountMenu(false)
                  onOpenAuth('login')
                }}
              >
                <UserPlus size={14} /> + Đăng nhập tài khoản khác
              </button>
              <button
                type="button"
                className="popover-btn logout-btn"
                onClick={() => {
                  setShowAccountMenu(false)
                  onLogout()
                }}
              >
                <LogOut size={14} /> Đăng xuất
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          className="user-profile-button"
          onClick={() => setShowAccountMenu(!showAccountMenu)}
          title="Nhấn để đổi tài khoản hoặc đăng xuất"
        >
          <img
            src={activeUser.avatar}
            alt={activeUser.fullName}
            className="user-profile-avatar"
          />
          <div className="user-profile-meta">
            <span className="user-profile-name">{activeUser.fullName}</span>
            <span className="user-profile-email">{activeUser.email}</span>
          </div>
          <ChevronUp size={16} className={`arrow-icon ${showAccountMenu ? 'rotated' : ''}`} />
        </button>
      </div>
    </aside>
  )
}
