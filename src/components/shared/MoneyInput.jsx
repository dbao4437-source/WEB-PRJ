export default function MoneyInput({value,onChange,error,disabled=false}){
 const digits=String(value??'').replace(/\D/g,'')
 const formatted=digits?Number(digits).toLocaleString('de-DE'):''
 function change(event){const raw=event.target.value.replace(/\D/g,'');onChange(raw?Number(raw):'')}
 return <div className="shared-field"><span className="shared-label">Học phí mỗi giờ</span><div className={`money-input-wrap ${disabled?'disabled':''}`}><input className="shared-input" type="text" inputMode="numeric" value={formatted} onChange={change} disabled={disabled} placeholder="150.000"/><span>đ/giờ</span></div>{disabled&&<small className="shared-hint">Học phí do quản trị viên quy định. Liên hệ admin nếu cần thay đổi</small>}{error&&<small className="field-error">{error}</small>}</div>
}
