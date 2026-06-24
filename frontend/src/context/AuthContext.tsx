import { createContext, useState, useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import { login as loginService, register as registerService } from '../services/authService'
import type { AuthContextType, LoginData, RegisterData, User } from '../types/User'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_TOKEN_KEY = 'smartTaskToken'
const STORAGE_USER_KEY = 'smartTaskUser'

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const payload = JSON.parse(window.atob(padded))
    return payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null
  } catch {
    return null
  }
}

function sanitizeUser(value: unknown): User | null {
  if (!value || typeof value !== 'object') return null

  const maybeUser = value as Partial<User>
  if (typeof maybeUser.email !== 'string') return null
  if (typeof maybeUser.id !== 'number') return null

  return {
    id: maybeUser.id,
    email: maybeUser.email,
    full_name: typeof maybeUser.full_name === 'string' ? maybeUser.full_name : undefined,
  }
}

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  const stored = window.localStorage.getItem(STORAGE_USER_KEY)
  if (!stored) return null

  try {
    return sanitizeUser(JSON.parse(stored))
  } catch {
    window.localStorage.removeItem(STORAGE_USER_KEY)
    return null
  }
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  const token = window.localStorage.getItem(STORAGE_TOKEN_KEY)
  if (!token) return null

  const payload = parseJwtPayload(token)
  if (!payload) {
    window.localStorage.removeItem(STORAGE_TOKEN_KEY)
    return null
  }

  const exp = payload.exp
  if (typeof exp === 'number' && exp * 1000 <= Date.now()) {
    window.localStorage.removeItem(STORAGE_TOKEN_KEY)
    return null
  }

  return token
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser)
  const [token, setToken] = useState<string | null>(getStoredToken)

  useEffect(() => {
    if (token) {
      window.localStorage.setItem(STORAGE_TOKEN_KEY, token)
    } else {
      window.localStorage.removeItem(STORAGE_TOKEN_KEY)
    }
  }, [token])

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
    } else {
      window.localStorage.removeItem(STORAGE_USER_KEY)
    }
  }, [user])

  const login = async (data: LoginData) => {
    const response = await loginService(data)
    setToken(response.access_token)
    const userData = sanitizeUser(response.user) ?? { id: 0, email: data.email }
    setUser(userData)
    return response
  }

  const register = async (data: RegisterData) => {
    const response = await registerService(data)
    return response
  }

  const logout = () => {
    setUser(null)
    setToken(null)
  }

  useEffect(() => {
    if (!token && user) {
      setUser(null)
    }
  }, [token, user])

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
