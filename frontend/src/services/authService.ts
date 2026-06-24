import type { LoginData, LoginResponse, RegisterData } from '../types/User'
import { request } from './api'

export function login(data: LoginData) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function register(data: RegisterData) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
