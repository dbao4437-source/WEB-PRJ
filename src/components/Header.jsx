import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  Search,
  ChevronDown,
  ShieldCheck,
  BookOpen,
  Layers,
  LogOut,
  User,
  GraduationCap
} from 'lucide-react'
import AuthModal from './AuthModal'

export default function Header() {
  const [currentUser, setCurrentUser] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState('login')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [exploreOpen, setExploreOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hsa_current_user')
      if (stored) {
        setCurrentUser(JSON.parse(stored))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    localStorage.setItem('hsa_current_user', JSON.stringify(user))
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('hsa_current_user')
  }

  const openLogin = () => {
    setAuthModalTab('login')
    setAuthModalOpen(true)
  }

  const openRegister = () => {
    setAuthModalTab('register')
    setAuthModalOpen(true)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchKeyword.trim()) {
      navigate(`/?search=${encodeURIComponent(searchKeyword.trim())}`)
    }
  }

  return (
    <>
      <header className="coursera-header-wrapper">
        {/* Main White Navbar (Logo + Search + Nav + Auth) */}
        <div className="coursera-main-nav">
          <div className="main-nav-inner">
            {/* Logo Coursera Style */}
            <Link to="/" className="coursera-brand">
              <span className="brand-coursera-text">hsa education</span>
            </Link>

            {/* Dropdown Khám phá */}
            <div className="nav-dropdown-wrapper">
              <button
                type="button"
                className="btn-explore-dropdown"
                onClick={() => setExploreOpen(!exploreOpen)}
              >
                <span>Khám phá</span>
                <ChevronDown size={15} />
              </button>

              {exploreOpen && (
                <div className="explore-menu-popup">
                  <div className="explore-popup-title">DANH MỤC LỚP HỌC</div>
                  <Link to="/" onClick={() => setExploreOpen(false)}>📚 Tất cả môn học (Màn 3)</Link>
                  <Link to="/classes/class-1" onClick={() => setExploreOpen(false)}>📐 Luyện thi Toán THPT</Link>
                  <Link to="/classes/class-2" onClick={() => setExploreOpen(false)}>🇨🇳 Tiếng Trung HSK</Link>
                  <Link to="/classes/class-3" onClick={() => setExploreOpen(false)}>⚡ Vật Lý nâng cao</Link>
                  <Link to="/classes/class-4" onClick={() => setExploreOpen(false)}>🧪 Hóa học đại học</Link>
                  <Link to="/classes/class-5" onClick={() => setExploreOpen(false)}>🇬🇧 IELTS Academic</Link>
                </div>
              )}
            </div>

            {/* Link Quản lý lớp học (Màn 4 của Người B) */}
            <NavLink
              to="/manage-classes"
              className={({ isActive }) => `btn-manage-classes-nav ${isActive ? 'active' : ''}`}
            >
              <ShieldCheck size={16} />
              <span>Quản lý lớp (Gia sư/Admin)</span>
            </NavLink>

            {/* Thanh Tìm Kiếm Tròn Tích Hợp Button Xanh (Coursera Search Bar) */}
            <form onSubmit={handleSearchSubmit} className="coursera-search-form">
              <input
                type="text"
                placeholder="Bạn muốn học môn gì hôm nay?"
                className="coursera-search-input"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <button type="submit" className="coursera-search-button" title="Tìm kiếm">
                <Search size={16} color="#ffffff" />
              </button>
            </form>

            {/* Nút Đăng nhập & Đăng ký / Thông tin tài khoản */}
            <div className="coursera-auth-actions">
              {currentUser ? (
                <div className="coursera-user-chip">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.fullName}
                    className="user-chip-avatar"
                  />
                  <div className="user-chip-info">
                    <span className="user-chip-name">{currentUser.fullName}</span>
                    <span className="user-chip-role">{currentUser.roleName || currentUser.role}</span>
                  </div>
                  <button
                    type="button"
                    className="user-chip-logout"
                    onClick={handleLogout}
                    title="Đăng xuất"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                <>
                  <button type="button" className="coursera-login-link" onClick={openLogin}>
                    Đăng nhập
                  </button>
                  <button type="button" className="coursera-join-free-btn" onClick={openRegister}>
                    Tham gia miễn phí
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal Đăng nhập / Đăng ký */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}
