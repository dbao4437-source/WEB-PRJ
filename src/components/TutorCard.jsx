import { Link } from 'react-router-dom'
import { LEVEL_LABELS } from '../../constants/options.js'
import { avatarUrl } from '../utils/avatarUrl.js'
export default function TutorCard({tutor}){
 const subjects=tutor.subjects||[],levels=tutor.levels||[],visibleLevels=levels.slice(0,2),extra=levels.length-visibleLevels.length
 const availability=tutor.availability?.slice(0,2).map(slot=>`${slot.day} · ${slot.shift}`).join(' / ')||'Lịch linh hoạt'
 const locations=tutor.areas||[]
 return <article className="tc-tutor-card"><div className="tc-card-heading">{tutor.avatar?<img src={avatarUrl(tutor.avatar)} alt={tutor.name}/>:<span className="tc-card-avatar-fallback">{tutor.name?.charAt(0)||'?'}</span>}<div className="tc-card-name"><h3>{tutor.name}</h3><p>{subjects.join(' · ')}</p></div></div><div className="tc-card-location-row"><span className="tc-rating-badge">★ {Number(tutor.rating).toFixed(1)}</span><span className="tc-card-location">⌖ {locations[0]||'Hà Nội'}{locations.length>1?` +${locations.length-1}`:''}</span></div><div className="tc-card-summary"><span><b>Kinh nghiệm</b>{tutor.experienceYears} năm</span><span><b>Lịch rảnh</b>{availability}</span></div><div className="tc-card-tags">{subjects.slice(0,2).map(subject=><span className="tc-subject-tag" key={subject}>{subject}</span>)}{subjects.length>2&&<span className="tc-level-tag">+{subjects.length-2}</span>}{visibleLevels.map(level=><span className="tc-level-tag" key={level}>{LEVEL_LABELS[level]||level}</span>)}{extra>0&&<span className="tc-level-tag">+{extra}</span>}</div><footer className="tc-card-footer"><div><strong>{new Intl.NumberFormat('vi-VN').format(tutor.fee)} đ<small>/giờ</small></strong><span>{tutor.mode==='Cả hai'?'Online / Offline':tutor.mode}</span></div><Link className="tc-card-action" to={`/tutors/${tutor.id}`}>Xem hồ sơ</Link></footer></article>
}


