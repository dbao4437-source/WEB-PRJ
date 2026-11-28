import React, { useEffect, useState } from 'react';
import { User, Save } from 'lucide-react';
import './StudentDashboard.css';
import { getLegacyProfile, saveLegacyProfile } from './api/legacyApi.js';

type Profile = { name: string; email: string; phone: string; grade: string; parentName: string; parentPhone: string };
const emptyProfile: Profile = { name: '', email: '', phone: '', grade: '', parentName: '', parentPhone: '' };

export default function StudentProfile() {
  const [studentInfo, setStudentInfo] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    getLegacyProfile().then((profile: any) => {
      if (active) setStudentInfo({ name: profile.fullName || profile.name || '', email: profile.email || '', phone: profile.phone || '', grade: profile.grade || '', parentName: profile.parentName || '', parentPhone: profile.parentPhone || '' });
    }).catch((error: unknown) => { if (active) setMessage(error instanceof Error ? error.message : 'Không tải được hồ sơ.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage('');
    try { await saveLegacyProfile({ fullName: studentInfo.name, phone: studentInfo.phone, grade: studentInfo.grade, parentName: studentInfo.parentName, parentPhone: studentInfo.parentPhone }); setMessage('Cập nhật thông tin tài khoản thành công!'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Không lưu được hồ sơ.'); }
  };
  const update = (key: keyof Profile, value: string) => setStudentInfo(current => ({ ...current, [key]: value }));
  return <div style={{ background: '#FFFFFF', padding: '36px', borderRadius: '20px', border: '1px solid #FEF08A', boxShadow: '0 4px 15px rgba(234,179,8,0.05)' }}>
    <h2 style={{ color: '#3D2B0F', marginBottom: '8px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}><User size={22} color="#CA8A04" /> Hồ sơ học viên &amp; Phụ huynh</h2>
    <p style={{ color: '#854D0E', marginBottom: '24px' }}>Quản lý thông tin cá nhân và số điện thoại liên hệ.</p>
    {loading ? <p>Đang tải hồ sơ...</p> : <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      {([['name','Họ và tên học viên'],['email','Email đăng nhập'],['phone','Số điện thoại học viên'],['grade','Cấp học / Khối lớp'],['parentName','Họ tên Phụ huynh'],['parentPhone','Số điện thoại Phụ huynh']] as const).map(([key,label]) => <div className="form-group" key={key}>
        <label style={{ fontWeight: 600, color: '#713F12', display: 'block', marginBottom: '8px' }}>{label}</label>
        <input type={key === 'email' ? 'email' : 'text'} className="form-input" value={studentInfo[key]} disabled={key === 'email'} onChange={e => update(key, e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #FEF08A', ...(key === 'email' ? { background: '#FEFCF0', color: '#716B5F' } : {}) }} />
      </div>)}
      <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>{message && <p role="status">{message}</p>}<button type="submit" className="btn-primary-custom" style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><Save size={16} /> Lưu thay đổi thông tin</button></div>
    </form>}
  </div>;
}
