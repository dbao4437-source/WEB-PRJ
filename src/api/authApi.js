import { request } from './client.js'
export const loginRequest=credentials=>request('/auth/login',{method:'POST',body:JSON.stringify(credentials)})
export const registerRequest=data=>request('/auth/register',{method:'POST',body:JSON.stringify(data)})
