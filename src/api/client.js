const API = import.meta.env.VITE_API_URL || '/api'
export async function request(path, options = {}) {
 const token=localStorage.getItem('token')
 const headers={...(token?{Authorization:`Bearer ${token}`}:{ }),...options.headers}
 if(options.body instanceof FormData)delete headers['Content-Type']
 else headers['Content-Type']='application/json'
 let response
 try { response=await fetch(`${API}${path}`,{...options,headers}) }
 catch { throw new Error('Không thể kết nối máy chủ. Hãy kiểm tra backend đang chạy.') }
 const body=response.status===204?null:await response.json().catch(()=>null)
 if(response.status===401){window.dispatchEvent(new Event('auth:unauthorized'));throw new Error(body?.message||'Phiên đăng nhập đã hết hạn.')}
 if(!response.ok)throw new Error(body?.message||`Yêu cầu thất bại (${response.status})`)
 return body
}
