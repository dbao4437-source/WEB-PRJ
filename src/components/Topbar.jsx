import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ChevronLeft,
  Share2,
  Copy,
  Settings,
  Bell,
  Check,
  ShieldCheck,
  Search,
  Sparkles
} from 'lucide-react'

export default function Topbar({ onOpenAuth }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [copied, setCopied] = useState(false)

  // Tiêu đề tương ứng theo route
  const getPageTitle = () => {
    if (location.pathname.startsWith('/classes/')) {
      return 'Luyện thi Toán THPT Chinh Phục Điểm 9+'
    }
    if (location.pathname === '/manage-classes') {
      return 'Bảng Quản lý & Điều phối Lớp học'
    }
    return 'Khám phá Lớp học & Gia sư'
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-back-btn"
          onClick={() => navigate(-1)}
          title="Quay lại trang trước"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="topbar-breadcrumb-box">
          <span className="breadcrumb-sub">HSA Education</span>
          <span className="breadcrumb-divider">/</span>
          <span className="breadcrumb-current">{getPageTitle()}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Nút Chuyển nhanh sang Quản trị (Người B) */}
        <Link to="/manage-classes" className="topbar-quick-role-btn">
          <ShieldCheck size={16} />
          <span>Gia sư / Admin</span>
        </Link>

        {/* Nút Share màu cam rực rỡ như ảnh mẫu PitchPlay */}
        <button type="button" className="topbar-share-btn" onClick={handleShare}>
          <Share2 size={16} />
          <span>{copied ? 'Đã sao chép link!' : 'Chia sẻ'}</span>
        </button>

        {/* Icon sao chép link */}
        <button
          type="button"
          className="topbar-icon-btn"
          onClick={handleShare}
          title="Sao chép liên kết"
        >
          {copied ? <Check size={16} color="#078f65" /> : <Copy size={16} />}
        </button>

        {/* Icon thông báo / cài đặt */}
        <button
          type="button"
          className="topbar-icon-btn"
          onClick={() => onOpenAuth('login')}
          title="Đổi tài khoản"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  )
}
