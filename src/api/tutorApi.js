import { request } from './client.js'

const apiFilterNames = { q:'keyword', search:'keyword', level:'grade', grade:'grade', mode:'format', teachingMode:'format', location:'area', dayOfWeek:'day', timeSlot:'shift' }
export function getTutors(filters = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue
    params.set(apiFilterNames[key] || key, String(value))
  }
  return request(`/tutors${params.size ? `?${params}` : ''}`)
}
export function getTutor(id) { return request(`/tutors/${encodeURIComponent(id)}`) }
export function getAdminTutors() { return request('/admin/tutors') }
export function getMyTutorProfile() { return request('/tutors/me') }
export function createTutor(data) { return request('/admin/tutors', { method:'POST', body:JSON.stringify(data) }) }
export function updateTutor(id, data) { return request(`/admin/tutors/${encodeURIComponent(id)}`, { method:'PUT', body:JSON.stringify(data) }) }
export function deleteTutor(id) { return request(`/admin/tutors/${encodeURIComponent(id)}`, { method:'DELETE' }) }
export function updateAvailability(id, availability) { return request(`/tutors/${encodeURIComponent(id)}/availability`, { method:'PUT', body:JSON.stringify({ availability }) }) }
export async function uploadTutorAvatar(file) { const form = new FormData(); form.append('image', file); return request('/tutors/upload/avatar', { method:'POST', body:form }) }
export function updateMyTutorProfile(data) { return request('/tutors/me', { method:'PUT', body:JSON.stringify(data) }) }
export function resetUserPassword(userId, password) { return request(`/users/${encodeURIComponent(userId)}/password`, { method:'PUT', body:JSON.stringify({ password }) }) }
