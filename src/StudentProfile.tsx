import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Save } from 'lucide-react';
import './StudentDashboard.css';

export default function StudentProfile() {
  const [studentInfo, setStudentInfo] = useState({
    name: 'LE HOANG LONG NHAT',
    email: 'nhat@gmail.com',
    phone: '0987654321',
    grade: 'Lớp 12',
    parentName: 'Nguyễn Văn Phụ Huynh',
    parentPhone: '0912345678'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cập nhật thông tin tài khoản thành công!');
  };

  return (
    <div style={{ background: '#FFFFFF', padding: '36px', borderRadius: '20px', border: '1px solid #FEF08A', boxShadow: '0 4px 15px rgba(234,179,8,0.05)' }}>
      <h2 style={{ color: '#3D2B0F', marginBottom: '8px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <User size={22} color="#CA8A04" /> Hồ sơ học viên & Phụ huynh
      </h2>
      <p style={{ color: '#854D0E', marginBottom: '24px' }}>
        Quản lý thông tin cá nhân, số điện thoại liên hệ và bảo mật tài khoản học tập của bạn.
      </p>

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="form-group">
          <label style={{ fontWeight: 600, color: '#713F12', display: 'block', marginBottom: '8px' }}>Họ và tên học viên</label>
          <input 
            type="text" 
            className="form-input" 
            value={studentInfo.name} 
            onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #FEF08A' }}
          />
        </div>

        <div className="form-group">
          <label style={{ fontWeight: 600, color: '#713F12', display: 'block', marginBottom: '8px' }}>Email đăng nhập</label>
          <input 
            type="email" 
            className="form-input" 
            value={studentInfo.email} 
            disabled 
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #FEF08A', background: '#FEFCF0', color: '#716B5F' }}
          />
        </div>

        <div className="form-group">
          <label style={{ fontWeight: 600, color: '#713F12', display: 'block', marginBottom: '8px' }}>Số điện thoại học viên</label>
          <input 
            type="text" 
            className="form-input" 
            value={studentInfo.phone} 
            onChange={(e) => setStudentInfo({...studentInfo, phone: e.target.value})}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #FEF08A' }}
          />
        </div>

        <div className="form-group">
          <label style={{ fontWeight: 600, color: '#713F12', display: 'block', marginBottom: '8px' }}>Cấp học / Khối lớp</label>
          <input 
            type="text" 
            className="form-input" 
            value={studentInfo.grade} 
            onChange={(e) => setStudentInfo({...studentInfo, grade: e.target.value})}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #FEF08A' }}
          />
        </div>

        <div className="form-group">
          <label style={{ fontWeight: 600, color: '#713F12', display: 'block', marginBottom: '8px' }}>Họ tên Phụ huynh</label>
          <input 
            type="text" 
            className="form-input" 
            value={studentInfo.parentName} 
            onChange={(e) => setStudentInfo({...studentInfo, parentName: e.target.value})}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #FEF08A' }}
          />
        </div>

        <div className="form-group">
          <label style={{ fontWeight: 600, color: '#713F12', display: 'block', marginBottom: '8px' }}>Số điện thoại Phụ huynh</label>
          <input 
            type="text" 
            className="form-input" 
            value={studentInfo.parentPhone} 
            onChange={(e) => setStudentInfo({...studentInfo, parentPhone: e.target.value})}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #FEF08A' }}
          />
        </div>

        <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
          <button type="submit" className="btn-primary-custom" style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <Save size={16} /> Lưu thay đổi thông tin
          </button>
        </div>
      </form>
    </div>
  );
}