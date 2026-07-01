const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const STORAGE_TOKEN_KEY = 'smartTaskToken'

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const payload = JSON.parse(window.atob(padded))

    if (!payload || typeof payload !== 'object') return null
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

function getValidatedToken(): string | null {
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

export async function request<T>(path: string, options: RequestInit = {}) {
  const token = getValidatedToken()
  const headers = new Headers(options.headers as HeadersInit)
  headers.set('Content-Type', 'application/json')

  const isAuthRoute = path.startsWith('/auth/login') || path.startsWith('/auth/register')

  if (token && !isAuthRoute) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = errorText || 'API request failed'

    try {
      const errorJson = JSON.parse(errorText)
      if (typeof errorJson === 'object' && errorJson !== null) {
        if ('detail' in errorJson) {
          errorMessage = Array.isArray(errorJson.detail)
            ? errorJson.detail.map((item: any) => item?.msg || item).join(' | ')
            : String(errorJson.detail)
        } else if ('message' in errorJson) {
          errorMessage = String(errorJson.message)
        }
      }
    } catch {
      // Keep raw text if JSON parse fails.
    }

    if (response.status === 429) {
      errorMessage =
        'AI quota exhausted. Please wait a moment or contact your administrator to increase the quota.'
    }

    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return null as unknown as T
  }

  return response.json() as Promise<T>
}
