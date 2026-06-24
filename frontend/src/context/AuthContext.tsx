import { createContext, useState, useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import { login as loginService, register as registerService } from '../services/authService'
import type { AuthContextType, LoginData, LoginResponse, RegisterData, User } from '../types/User'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_TOKEN_KEY = 'smartTaskToken'
const STORAGE_USER_KEY = 'smartTaskUser'

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  const stored = window.localStorage.getItem(STORAGE_USER_KEY)
  return stored ? JSON.parse(stored) : null
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(STORAGE_TOKEN_KEY)
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
    const userData = response.user ?? { id: 0, email: data.email }
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
