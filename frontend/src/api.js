const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export async function api(path, options = {}) {
  const token = localStorage.getItem('accessToken')
  const headers = new Headers(options.headers || {})
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error('DigiAware API is unavailable. Start the Django server and try again.')
  }

  if (response.status === 401 && token && !options.retry && localStorage.getItem('refreshToken')) {
    const refreshed = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: localStorage.getItem('refreshToken') }),
    })
    if (refreshed.ok) {
      const { access, refresh } = await refreshed.json()
      localStorage.setItem('accessToken', access)
      if (refresh) localStorage.setItem('refreshToken', refresh)
      return api(path, { ...options, retry: true })
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = Object.values(payload).flat().find((value) => typeof value === 'string')
    throw new Error(message || `Request failed (${response.status}).`)
  }
  return payload
}

export function listOf(payload) {
  return Array.isArray(payload) ? payload : payload.results || []
}
