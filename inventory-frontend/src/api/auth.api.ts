import axiosInstance from './axiosInstance'
import { AuthResponse, LoginRequest } from '@/types'

export const authApi = {
  login: (data: LoginRequest) =>
    axiosInstance.post<AuthResponse>('/auth/login', data).then(r => r.data),

  register: (data: Record<string, unknown>) =>
    axiosInstance.post<AuthResponse>('/auth/register', data).then(r => r.data),

  refreshToken: (refreshToken: string) =>
    axiosInstance.post<AuthResponse>('/auth/refresh-token', { refreshToken }).then(r => r.data),

  logout: () =>
    axiosInstance.post('/auth/logout').then(r => r.data),

  forgotPassword: (email: string) =>
    axiosInstance.post('/auth/forgot-password', { email }).then(r => r.data),

  resetPassword: (token: string, newPassword: string) =>
    axiosInstance.post('/auth/reset-password', { token, newPassword }).then(r => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    axiosInstance.post('/auth/change-password', { currentPassword, newPassword }).then(r => r.data),
}
