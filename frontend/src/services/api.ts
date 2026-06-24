const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export async function request<T>(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartTaskToken') : null
  const headers = new Headers(options.headers as HeadersInit)
  headers.set('Content-Type', 'application/json')

  if (token) {
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

    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return null as unknown as T
  }

  return response.json() as Promise<T>
}
