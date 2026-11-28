import { request } from '../api/client.js'
import type { Booking, Tutor } from '../types'
async function data<T>(promise:Promise<any>):Promise<{data:T}>{const result=await promise;return result?.data!==undefined?result:{data:result}}
export const api={
 getProfile:()=>data<Tutor & {fullName:string;phone?:string}>(request('/auth/profile')),
 updateProfile:(payload:Record<string,unknown>)=>data<unknown>(request('/auth/profile',{method:'PUT',body:JSON.stringify(payload)})),
 tutors:(params:URLSearchParams)=>{const aliases:Record<string,string>={search:'keyword',q:'keyword',grade:'grade',level:'grade',location:'area',mode:'format',teachingMode:'format',dayOfWeek:'day',timeSlot:'shift'};const next=new URLSearchParams();params.forEach((value,key)=>next.set(aliases[key]||key,value));return data<Tutor[]>(request(`/tutors?${next}`))},
 createBooking:(payload:Record<string,unknown>)=>data<Booking>(request('/bookings',{method:'POST',body:JSON.stringify(payload)})),
 bookings:(status='')=>data<Booking[]>(request(`/bookings${status?`?status=${encodeURIComponent(status)}`:''}`)),
 approve:(id:string)=>data<Booking>(request(`/bookings/${encodeURIComponent(id)}/approve`,{method:'PATCH'})),
 reject:(id:string)=>data<Booking>(request(`/bookings/${encodeURIComponent(id)}/reject`,{method:'PATCH'})),
}
