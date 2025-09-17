import request from '@/utils/request'

export function register(userName, userPwd) {
  return request.post('/users/register', { userName, userPwd })
} 
export function login(userName, userPwd) {
  return request.post('/users/login', { userName, userPwd })
} 
export function updatePassword(userName, userPwd,newPwd) {
  return request.post('/users/updatePassword', { userName, userPwd,newPwd })
} 