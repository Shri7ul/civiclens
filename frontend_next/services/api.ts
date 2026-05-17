import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
})

type LoginPayload = { email: string; password: string }
type RegisterPayload = { name?: string; email: string; password: string }

async function handleError(e: any){
  if (e?.response?.data) {
    const d = e.response.data
    return Promise.reject(d.detail ?? d.message ?? JSON.stringify(d))
  }
  return Promise.reject(e.message ?? String(e))
}

export async function login(payload: LoginPayload){
  try{
    const res = await api.post('/login', payload)
    return res.data
  }catch(e){
    return handleError(e)
  }
}

export async function register(payload: RegisterPayload){
  try{
    const res = await api.post('/register', payload)
    return res.data
  }catch(e){
    return handleError(e)
  }
}

export async function registerOfficer(payload: RegisterPayload){
  try{const res = await api.post('/register-officer', payload); return res.data}catch(e){return handleError(e)}
}

export async function registerAuthority(payload: RegisterPayload){
  try{const res = await api.post('/register-authority', payload); return res.data}catch(e){return handleError(e)}
}

export async function registerContractor(payload: RegisterPayload){
  try{const res = await api.post('/register-contractor', payload); return res.data}catch(e){return handleError(e)}
}

export async function registerAdmin(payload: RegisterPayload){
  try{const res = await api.post('/register-admin', payload); return res.data}catch(e){return handleError(e)}
}

export async function getMyPoliceRequests(user_id: number){
  try{const res = await api.get(`/my-police-requests/${user_id}`); return res.data}catch(e){return handleError(e)}
}

export async function addPoliceRequest(payload: { user_id: number; category: string; request_type: string; description: string }){
  try{const res = await api.post('/add-police-request', payload); return res.data}catch(e){return handleError(e)}
}

export async function getCaseUpdates(police_request_id: number){
  try{const res = await api.get(`/case-updates/${police_request_id}`); return res.data}catch(e){return handleError(e)}
}

export default api
