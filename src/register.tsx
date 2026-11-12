import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Chung file css với login

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student' // Mặc định là học viên
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role
        })
      });
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Đăng ký thành công! Đang chuyển hướng về trang chủ...');
        localStorage.setItem('token', data.token); // Lưu token (nếu backend trả về token khi đăng ký)
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
      <div className="login-card" style={{ maxWidth: '950px' }}>
        
        {/* CỘT TRÁI: Tông màu Vàng & Trắng chủ đạo */}
        <div className="login-left">
          <div>
            <div className="brand-logo">
              <div className="logo-box">T</div>
              <span className="brand-name">TutorCenter</span>
            </div>

            <div className="badge">
              ⭐ Nền tảng kết nối gia sư hàng đầu
            </div>

            <h1>
              Sẵn sàng đồng hành cùng <span>hàng triệu học viên</span> chinh phục tri thức
            </h1>
            
            <p>
              Tạo tài khoản để bắt đầu trải nghiệm hệ thống tìm kiếm gia sư cá nhân hoá, lộ trình học tập thông minh và bứt phá điểm số.
            </p>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <span className="check-icon">✓</span>
              <span>Lộ trình học tập cá nhân hoá 1 kèm 1</span>
            </div>
            <div className="feature-item">
              <span className="check-icon">✓</span>
              <span>Đội ngũ gia sư xuất sắc, kiểm duyệt kỹ lưỡng</span>
            </div>
            <div className="feature-item">
              <span className="check-icon">✓</span>
              <span>Hỗ trợ kết nối và đổi gia sư linh hoạt</span>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Form Đăng ký */}
        <div className="login-right" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '36px 48px' }}>
          
          {/* Phần tiêu đề và tab cố định không bị trôi */}
          <div>
            <div className="form-header" style={{ marginBottom: '16px' }}>
              <h2>Đăng ký</h2>
              <Link to="/" className="back-link">← Trang chủ</Link>
            </div>

            {/* Tab chuyển đổi */}
            <div className="tab-switch" style={{ marginBottom: '16px' }}>
              <Link to="/login" className="tab-inactive">Đăng nhập</Link>
              <button className="tab-active">Đăng ký</button>
            </div>

            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
              Tạo tài khoản để bắt đầu kết nối với gia sư và quản lý lộ trình học tập.
            </p>
          </div>

          {/* Phần nội dung form có thanh cuộn riêng nếu dài */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', maxHeight: '420px' }}>
            {error && <div className="error-message">{error}</div>}
            {success && <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{success}</div>}

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Họ và tên</label>
                <input 
                  type="text" 
                  name="fullName"
                  placeholder="Nguyễn Văn A" 
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="form-input"
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="email@gmail.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input 
                  type="text" 
                  name="phone"
                  placeholder="09xx xxx xxx" 
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="form-input"
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                />
              </div>

              <div className="form-group">
                <label>Vai trò của bạn</label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                  className="form-input"
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                >
                  <option value="student">Học viên / Phụ huynh</option>
                  <option value="tutor">Gia sư</option>
                </select>
              </div>

              <div className="form-group">
                <label>Mật khẩu</label>
                <input 
                  type="password" 
                  name="password"
                  placeholder="Nhập mật khẩu" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input"
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                />
              </div>

              <div className="form-group">
                <label>Nhập lại mật khẩu</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="form-input"
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                />
              </div>

              <button type="submit" className="btn-submit" style={{ marginTop: '12px' }}>
                Tạo tài khoản
              </button>
            </form>

            <p className="register-redirect" style={{ marginTop: '16px', marginBottom: '8px' }}>
              Bạn đã có tài khoản?{' '}
              <Link to="/login" className="register-link">
                Đăng nhập ngay
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

