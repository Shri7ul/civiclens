export interface User {
  id: number
  name: string
  email: string
  role: string
}

export interface DashboardStats {
  total_users: number
  total_officers: number
  total_authorities: number
  total_contractors: number
  total_police_requests: number
  total_active_investigations: number
}
