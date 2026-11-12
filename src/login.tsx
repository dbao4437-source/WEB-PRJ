import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Import file CSS riêng cho trang Login

export default function Login() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(' ');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Đăng ký thành công! Đang chuyển hướng về trang chủ...');
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role); // Lưu token (nếu backend trả về token khi đăng ký)
        setTimeout(() => {
          navigate('/'); // Chuyển hướng về trang chủ
        }, 1500);
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối đến server!');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        {/* CỘT TRÁI: Màu Vàng kết hợp Trắng chủ đạo */}
        <div className="login-left">
          <div>
            <div className="brand-logo">
              <div className="logo-box">T</div>
              <span className="brand-name">TutorCenter</span>
            </div>

            <div className="badge">
              ⭐ Nền tảng kết nối gia sư hàng đầu, đưa bạn chạm tay đến ước mơ 
            </div>

            <h1>
              Kết nối học viên với <span>đội ngũ gia sư</span> xuất sắc nhất
            </h1>
            
            <p>
              Hệ thống luyện thi chuyên sâu với lộ trình cá nhân hóa, ngân hàng đề thi thử sát đề và đội ngũ gia sư hàng đầu, 
            </p>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <span className="check-icon">✓</span>
              <span>Gia sư uy tín, điểm số cao, kiểm duyệt kỹ lưỡng</span>
            </div>
            <div className="feature-item">
              <span className="check-icon">✓</span>
              <span>Lộ trình học tập linh hoạt 1 kèm 1</span>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Form Đăng nhập */}
        <div className="login-right">
          <div className="form-header">
            <h2>Đăng nhập</h2>
            <Link to="/" className="back-link">← Trang chủ</Link>
          </div>

          <div className="tab-switch">
            <button className="tab-active">Đăng nhập</button>
            <Link to="/register" className="tab-inactive">Đăng ký</Link>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="email@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                style={{ color: '#000000', backgroundColor: '#ffffff'}}
              />
            </div>

            <div className="form-group">
              <div className="label-flex">
                <label>Mật khẩu</label>
                <a href="#" className="forgot-pass">Quên mật khẩu?</a>
              </div>
              <input 
                type="password" 
                placeholder="Nhập mật khẩu" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <button type="submit" className="btn-submit">
              Đăng nhập
            </button>
          </form>

          <p className="register-redirect">
            Bạn chưa có tài khoản?{' '}
            <Link to="/register" className="register-link">
              Đăng ký ngay
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}