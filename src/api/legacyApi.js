import { request } from './client.js'
export const getLegacyProfile=()=>request('/auth/profile')
export const saveLegacyProfile=data=>request('/auth/profile',{method:'PUT',body:JSON.stringify(data)})
export const searchLegacyTutors=(query,subject)=>request(`/tutors?keyword=${encodeURIComponent(query)}&subject=${encodeURIComponent(subject==='Tất cả môn dạy'?'':subject)}`)
export const deleteLegacyUser=id=>request(`/users/${encodeURIComponent(id)}`,{method:'DELETE'})
export const getLegacyUsers=()=>request('/users')
