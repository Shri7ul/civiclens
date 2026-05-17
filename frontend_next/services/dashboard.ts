import API from '../lib/api'

export async function getStats(){
  return API.get('/system-stats')
}
