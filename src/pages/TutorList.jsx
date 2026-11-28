import { useEffect, useMemo, useRef, useState } from 'react'
import { AREA_OPTIONS, LEVEL_OPTIONS, SUBJECT_OPTIONS } from '../../constants/options.js'
import TutorCard from '../components/TutorCard.jsx'
import TutorSearchAutocomplete from '../components/TutorSearchAutocomplete.jsx'
import { getTutors } from '../api/tutorApi.js'

const blank={q:'',subject:'',level:'',area:'',mode:'',day:'',shift:''}
const days=['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ Nhật']
const sortOptions=[
 {value:'default',label:'Mặc định'},
 {value:'fee-asc',label:'Học phí: Thấp đến cao'},
 {value:'fee-desc',label:'Học phí: Cao đến thấp'},
 {value:'rating-desc',label:'Đánh giá: Cao nhất'},
 {value:'rating-asc',label:'Đánh giá: Thấp nhất'},
 {value:'experience-desc',label:'Kinh nghiệm: Nhiều nhất'},
]
function FilterField({label,children}){return <label className="tutor-filter-field"><span>{label}</span>{children}</label>}

export default function TutorList(){
 const [form,setForm]=useState(blank),[search,setSearch]=useState(''),[sort,setSort]=useState('default'),[tutors,setTutors]=useState([]),[suggestionTutors,setSuggestionTutors]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[retry,setRetry]=useState(0)
 const suggestionDataLoaded=useRef(false)
 useEffect(()=>{const id=setTimeout(()=>setForm(value=>value.q===search?value:{...value,q:search}),400);return()=>clearTimeout(id)},[search])
 const query=useMemo(()=>form,[form])
 useEffect(()=>{let active=true;setLoading(true);setError('');getTutors({...query,sort}).then(data=>{if(active){setTutors(data);if(!suggestionDataLoaded.current){suggestionDataLoaded.current=true;setSuggestionTutors(data)}}}).catch(error=>{if(active)setError(error.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[query,sort,retry])
 const visibleTutors=useMemo(()=>{
  const result=[...tutors]
  switch(sort){
   case 'fee-asc': return result.sort((a,b)=>Number(a.fee)-Number(b.fee))
   case 'fee-desc': return result.sort((a,b)=>Number(b.fee)-Number(a.fee))
   case 'rating-desc': return result.sort((a,b)=>Number(b.rating)-Number(a.rating))
   case 'rating-asc': return result.sort((a,b)=>Number(a.rating)-Number(b.rating))
   case 'experience-desc': return result.sort((a,b)=>Number(b.experienceYears)-Number(a.experienceYears))
   default: return result
  }
 },[tutors,sort])
 const change=(key,value)=>setForm(old=>({...old,[key]:value}))
 const searchNow=()=>{setForm(old=>old.q===search?old:{...old,q:search});setRetry(value=>value+1)}
 const reset=()=>{setForm(blank);setSearch('');setSort('default')}
 const hasActiveFilters=Boolean(search.trim()||form.subject||form.level||form.area||form.mode||form.day||form.shift||sort!=='default')
 return <div className="tutor-list-page"><section className="tutor-search-hero"><div className="tutor-search-intro"><span className="banner-tag">Đội ngũ gia sư chất lượng</span><h1>Tìm gia sư phù hợp với bạn</h1><p>Lọc theo môn học, cấp lớp, khu vực và thời gian rảnh.</p></div>
  <div className="tutor-filter-bar" aria-label="Bộ lọc gia sư">
   <div className="tutor-keyword-row">
    <div className="tutor-keyword-field"><span>Từ khóa</span><TutorSearchAutocomplete value={search} onChange={setSearch} tutors={suggestionTutors}/></div>
    <button className="tutor-search-button" type="button" aria-label="Tìm gia sư" onClick={searchNow}>⌕</button>
   </div>
   <div className="tutor-filter-row">
    <FilterField label="Môn học"><select className="filter-select" value={form.subject} onChange={event=>change('subject',event.target.value)}><option value="">Tất cả môn</option>{SUBJECT_OPTIONS.map(item=><option key={item}>{item}</option>)}</select></FilterField>
    <FilterField label="Cấp lớp"><select className="filter-select" value={form.level} onChange={event=>change('level',event.target.value)}><option value="">Tất cả cấp lớp</option>{LEVEL_OPTIONS.map(item=><option key={item}>{item}</option>)}</select></FilterField>
    <FilterField label="Khu vực"><select className="filter-select" value={form.area} onChange={event=>change('area',event.target.value)}><option value="">Tất cả khu vực</option>{AREA_OPTIONS.map(item=><option key={item}>{item}</option>)}</select></FilterField>
    <FilterField label="Hình thức"><select className="filter-select" value={form.mode} onChange={event=>change('mode',event.target.value)}><option value="">Online &amp; Offline</option><option>Online</option><option>Offline</option></select></FilterField>
    <FilterField label="Ngày dạy"><select className="filter-select" value={form.day} onChange={event=>change('day',event.target.value)}><option value="">Mọi ngày</option>{days.map(item=><option key={item}>{item}</option>)}</select></FilterField>
    <FilterField label="Ca dạy"><select className="filter-select" value={form.shift} onChange={event=>change('shift',event.target.value)}><option value="">Mọi ca</option>{['Sáng','Chiều','Tối'].map(item=><option key={item}>{item}</option>)}</select></FilterField>
    <FilterField label="Sắp xếp"><select className="filter-select" value={sort} onChange={event=>setSort(event.target.value)}>{sortOptions.map(item=><option value={item.value} key={item.value}>{item.label}</option>)}</select></FilterField>
   </div>
  </div>
  <div className="tutor-filter-reset-row"><button className={`tutor-filter-reset-link${hasActiveFilters?' is-active':''}`} type="button" onClick={reset}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 6A5.2 5.2 0 1 1 3 9.3"/><path d="M3.2 2.8V6h3.2"/></svg>Đặt lại bộ lọc</button></div>
 </section><div className="tc-results-head"><h2>Danh sách gia sư <span className="tutor-count-badge">{loading?'…':visibleTutors.length}</span></h2><span>{loading?'Đang tải danh sách…':'Chọn một hồ sơ để xem thông tin chi tiết'}</span></div>{error&&<div className="tc-notice error" role="alert">{error}<button className="btn-outline-custom" onClick={()=>setRetry(value=>value+1)}>Thử lại</button></div>}{loading?<div className="tc-empty">Đang tải danh sách gia sư…</div>:error?null:visibleTutors.length?<div className="tc-tutor-grid">{visibleTutors.map(tutor=><TutorCard key={tutor.id} tutor={tutor}/>)}</div>:<div className="tc-empty">Không có gia sư phù hợp</div>}</div>
}
