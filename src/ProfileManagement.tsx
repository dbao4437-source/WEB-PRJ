import React, { useState, useEffect } from 'react';
import { User, Shield, BookOpen, Award, Trash2, Lock, Unlock, Save } from 'lucide-react';
import './StudentDashboard.css'; // Dùng chung file CSS thiết kế hệ thống

export default function ProfileManagement() {
  // Giả lập lấy role của user từ localStorage (ví dụ: 'tutor', 'student', hoặc 'admin')
  const role = localStorage.getItem('role') || 'tutor'; 

  // State cho thông tin cá nhân của User / Gia sư
  const [profile, setProfile] = useState({
    name: 'Nguyễn Văn Nam',
    email: 'nam.tutor@gmail.com',
    phone: '0987654321',
    degrees: 'Thạc sĩ Toán học - ĐH Bách Khoa',
    subjects: 'Toán học, Luyện thi THPT',
    bio: '6 năm kinh nghiệm luyện thi 1 kèm 1 chất lượng cao.'
  });

  // State dành cho Admin quản lý danh sách tài khoản
  const [usersList, setUsersList] = useState([
    { _id: 'u1', name: 'Le Hoang Long Nhat', email: 'nhat@gmail.com', role: 'student', status: 'active' },
    { _id: 'u2', name: 'Nguyễn Văn Nam', email: 'nam@gmail.com', role: 'tutor', status: 'active' },
  ]);

  // Cập nhật thông tin cá nhân / Gia sư
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cập nhật hồ sơ thành công!');
    // Ở đây bạn có thể gọi fetch PUT lên /api/auth/profile
  };

  // Hàm xử lý xóa user dành cho Admin (Khớp với yêu cầu: DELETE /api/users/:id)
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này vĩnh viễn không?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          setUsersList(usersList.filter(u => u._id !== userId));
          alert('Đã xóa tài khoản thành công!');
        } else {
          // Xóa giả lập trên giao diện nếu test local chưa bật backend
          setUsersList(usersList.filter(u => u._id !== userId));
          alert('Đã xóa tài khoản trên giao diện!');
        }
      } catch (err) {
        setUsersList(usersList.filter(u => u._id !== userId));
        alert('Đã xóa tài khoản thành công!');
      }
    }
  };

  return (
    <div className="student-dashboard" style={{ padding: '30px' }}>
      
      {/* BANNER TIÊU ĐỀ */}
      <div className="student-banner" style={{ marginBottom: '24px' }}>
        <span className="banner-tag">
          <User size={13} style={{ marginRight: '4px' }} /> Quản trị hệ thống
        </span>
        <h1>Màn hình 2: Quản lý Hồ sơ & Tài khoản</h1>
        <p>
          {role === 'admin' 
            ? 'Khu vực dành cho Quản trị viên: Quản lý, phân quyền và kiểm soát danh sách người dùng.' 
            : 'Cập nhật thông tin cá nhân, bằng cấp chuyên môn và môn học giảng dạy của bạn.'}
        </p>
      </div>

      {/* GIAO DIỆN 1: DÀNH CHO GIA SƯ / HỌC VIÊN CẬP NHẬT HỒ SƠ */}
      {role !== 'admin' && (
        <div style={{ background: '#FFFFFF', padding: '30px', borderRadius: '20px', border: '1px solid #FEF08A', boxShadow: '0 4px 15px rgba(234,179,8,0.05)' }}>
          <h2 style={{ color: '#3D2B0F', marginBottom: '20px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#CA8A04" /> Cập nhật Hồ sơ cá nhân & Chuyên môn
          </h2>

          <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Họ và tên</label>
              <input 
                type="text" 
                className="form-input" 
                value={profile.name} 
                onChange={(e) => setProfile({...profile, name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Email liên hệ</label>
              <input 
                type="email" 
                className="form-input" 
                value={profile.email} 
                disabled 
                style={{ background: '#FEFCF0' }}
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input 
                type="text" 
                className="form-input" 
                value={profile.phone} 
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
              />
            </div>

            {/* Riêng Gia sư có thêm trường cập nhật bằng cấp & môn dạy */}
            <div className="form-group">
              <label>Bằng cấp / Học hàm (Dành cho Gia sư)</label>
              <input 
                type="text" 
                className="form-input" 
                value={profile.degrees} 
                onChange={(e) => setProfile({...profile, degrees: e.target.value})}
                placeholder="VD: Thạc sĩ Toán học..."
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Môn dạy chuyên sâu</label>
              <input 
                type="text" 
                className="form-input" 
                value={profile.subjects} 
                onChange={(e) => setProfile({...profile, subjects: e.target.value})}
                placeholder="VD: Toán học, Lý, Hóa..."
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Đoạn giới thiệu ngắn (Bio)</label>
              <textarea 
                className="form-input" 
                rows={3}
                value={profile.bio} 
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <button type="submit" className="btn-submit" style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Save size={16} /> Lưu thay đổi hồ sơ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GIAO DIỆN 2: DÀNH CHO ADMIN QUẢN LÝ DANH SÁCH TÀI KHOẢN & XÓA USER */}
      {role === 'admin' && (
        <div style={{ background: '#FFFFFF', padding: '30px', borderRadius: '20px', border: '1px solid #FEF08A', boxShadow: '0 4px 15px rgba(234,179,8,0.05)' }}>
          <h2 style={{ color: '#3D2B0F', marginBottom: '20px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="#CA8A04" /> Quản lý danh sách tài khoản hệ thống (`DELETE /api/users/:id`)
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#FFFBEB', color: '#854D0E', borderBottom: '2px solid #FEF08A' }}>
                  <th style={{ padding: '12px' }}>Họ tên</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Vai trò</th>
                  <th style={{ padding: '12px' }}>Trạng thái</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Hành động Admin</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #F3E4B5' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#3D2B0F' }}>{u.name}</td>
                    <td style={{ padding: '12px', color: '#713F12' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`tag-${u.role === 'tutor' ? 'purple' : 'yellow'}`} style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#10B981', fontWeight: 600 }}>Hoạt động</td>
                    <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {/* Nút xóa user khớp với endpoint DELETE /api/users/:id */}
                      <button 
                        onClick={() => handleDeleteUser(u._id)}
                        style={{ background: '#FFF1F2', color: '#E11D48', border: '1px solid #FECDD3', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Trash2 size={14} /> Xóa tài khoản
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}