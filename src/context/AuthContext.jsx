import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginRequest } from '../api/authApi.js'
/** @type {import('react').Context<{user: {id:string,name:string,role:string,tutorId:string|null,avatar?:string}|null, token:string|null, login:(email:string,password:string)=>Promise<{id:string,name:string,role:string,tutorId:string|null}>, logout:()=>void, updateUser:(partial:object)=>void}|null>} */
const AuthContext=createContext(null)
export function AuthProvider({children}){
 const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('user')||'null')}catch{return null}})
 const [token,setToken]=useState(()=>localStorage.getItem('token'))
 const logout=()=>{localStorage.removeItem('token');localStorage.removeItem('user');localStorage.removeItem('role');localStorage.removeItem('userId');setUser(null);setToken(null)}
 useEffect(()=>{const unauthorized=()=>logout();window.addEventListener('auth:unauthorized',unauthorized);return()=>window.removeEventListener('auth:unauthorized',unauthorized)},[])
 const login=async(email,password)=>{const result=await loginRequest({email,password});localStorage.setItem('token',result.token);localStorage.setItem('user',JSON.stringify(result.user));localStorage.setItem('role',result.user.role);localStorage.setItem('userId',result.user.id);setToken(result.token);setUser(result.user);return result.user}
 const updateUser=partial=>setUser(current=>{if(!current)return current;const next={...current,...partial};localStorage.setItem('user',JSON.stringify(next));return next})
 const value=useMemo(()=>({user,token,login,logout,updateUser}),[user,token])
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('useAuth phải được dùng trong AuthProvider');return value}



