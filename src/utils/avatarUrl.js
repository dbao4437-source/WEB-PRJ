export function avatarUrl(value){
 if(!value)return ''
 if(/^(https?:|data:|blob:)/i.test(value))return value
 const configured=import.meta.env.VITE_API_URL||'/api'
 const base=configured.replace(/\/api\/?$/,'')||'http://localhost:5000'
 return `${base}${value.startsWith('/')?'':'/'}${value}`
}
