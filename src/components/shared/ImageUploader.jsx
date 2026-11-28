import { useState } from 'react'
import { uploadTutorAvatar } from '../../api/tutorApi.js'
import { avatarUrl } from '../../utils/avatarUrl.js'
export default function ImageUploader({value='',name='',onChange,error}){
 const [busy,setBusy]=useState(false),[localError,setLocalError]=useState('')
 async function choose(event){const file=event.target.files?.[0];event.target.value='';if(!file)return;setLocalError('');const allowed={'image/jpeg':['.jpg','.jpeg'],'image/png':['.png'],'image/webp':['.webp']};const ext=file.name.slice(file.name.lastIndexOf('.')).toLowerCase();if(!allowed[file.type]?.includes(ext)){setLocalError('Chỉ nhận ảnh JPG, PNG hoặc WEBP.');return}if(file.size>2*1024*1024){setLocalError('Ảnh vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn.');return}setBusy(true);try{const result=await uploadTutorAvatar(file);onChange(result.path)}catch(e){setLocalError(e.message||'Không tải được ảnh.')}finally{setBusy(false)}}
 const message=error||localError
 return <div className="shared-field"><span className="shared-label">Ảnh đại diện</span><div className="image-uploader"><div className="image-preview">{value?<img src={avatarUrl(value)} alt={`Ảnh ${name||'gia sư'}`}/>:<span>{name.trim().charAt(0).toUpperCase()||'?'}</span>}</div><div className="image-upload-controls"><label className="shared-file-button">{busy?'Đang tải ảnh…':'Chọn ảnh từ máy'}<input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={choose} disabled={busy}/></label>{value&&<button type="button" className="shared-remove-button" onClick={()=>onChange('')}>Xóa ảnh</button>}<small>JPG, PNG hoặc WEBP · tối đa 2MB</small></div></div>{message&&<small className="field-error">{message}</small>}</div>
}


