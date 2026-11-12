import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './login';
import Register from './register';
import StudentDashboard from './StudentDashboard'; // Import giao diện học viên vừa tạo
import './Login.css';

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    alert('Đã đăng xuất thành công!');
    navigate('/login');
  };

  // Nếu là học viên -> Hiển thị component riêng biệt đã có CSS
  if (token && role === 'student') {
    return <StudentDashboard />;
  }

  // Các trường hợp chưa đăng nhập, gia sư hoặc admin
  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '900px', padding: '48px', display: 'block' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#fef08a', color: '#ca8a04', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
              T
            </div>
            <span style={{ fontWeight: '700', fontSize: '20px', color: '#713f12' }}>TutorCenter</span>
          </div>

          {token ? (
            <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
              Đăng xuất
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/login" style={{ padding: '8px 16px', backgroundColor: '#eab308', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>
                Đăng nhập
              </Link>
              <Link to="/register" style={{ padding: '8px 16px', backgroundColor: '#fef08a', color: '#713f12', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {!token ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <h1 style={{ color: '#713f12', fontSize: '26px', fontWeight: '800', marginBottom: '12px' }}>
              Nền tảng kết nối gia sư và học tập thông minh
            </h1>
            <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '24px' }}>
              Vui lòng đăng nhập hoặc đăng ký tài khoản để bắt đầu sử dụng các tính năng của hệ thống.
            </p>
          </div>
        ) : role === 'tutor' ? (
          <div style={{ backgroundColor: '#f0fdf4', padding: '24px', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '99px' }}>
              📚 Giao diện Gia sư
            </span>
            <h2 style={{ color: '#14532d', fontSize: '22px', fontWeight: '700', margin: '12px 0 8px 0' }}>
              Xin chào Thầy/Cô gia sư!
            </h2>
            <p style={{ color: '#166534', fontSize: '14px', marginBottom: '16px' }}>
              Quản lý lịch dạy, nhận lớp mới và theo dõi thông tin cá nhân của bạn tại hệ thống này.
            </p>
          </div>
        ) : role === 'admin' ? (
          <div style={{ backgroundColor: '#fdf4f8', padding: '24px', borderRadius: '16px', border: '1px solid #fbcfe8' }}>
            <span style={{ backgroundColor: '#fce7f3', color: '#9d174d', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '99px' }}>
              ⚙️ Giao diện Quản trị viên (Admin)
            </span>
            <h2 style={{ color: '#831843', fontSize: '22px', fontWeight: '700', margin: '12px 0 8px 0' }}>
              Bảng điều khiển Quản trị hệ thống
            </h2>
            <p style={{ color: '#9d174d', fontSize: '14px', marginBottom: '16px' }}>
              Kiểm duyệt tài khoản gia sư, quản lý danh sách học viên và thống kê dữ liệu toàn bộ trung tâm.
            </p>
          </div>
        ) : null}

      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}