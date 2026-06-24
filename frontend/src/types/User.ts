export interface User {
  id: number
  email: string
  full_name?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user?: User
}

export interface RegisterData {
  email: string
  password: string
  full_name?: string
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (data: LoginData) => Promise<{ access_token: string; token_type: string }>
  register: (data: RegisterData) => Promise<unknown>
  logout: () => void
}
