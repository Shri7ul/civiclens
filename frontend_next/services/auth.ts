import API from '../lib/api'

export async function login(email: string, password: string){
  return API.post('/login', { email, password })
}

export async function register(payload: any){
  return API.post('/register', payload)
}
