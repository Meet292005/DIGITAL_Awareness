import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('accessToken')))
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) return
    api('/auth/profile/')
      .then(setUser)
      .catch((reason) => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setUser(null)
        setAuthError(reason.message)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(username, password) {
    const tokens = await api('/auth/token/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    localStorage.setItem('accessToken', tokens.access)
    localStorage.setItem('refreshToken', tokens.refresh)
    const profile = await api('/auth/profile/')
    setUser(profile)
    return profile
  }

  async function register(fields) {
    await api('/auth/register/', { method: 'POST', body: JSON.stringify(fields) })
    return await login(fields.username, fields.password)
  }

  function logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  async function updateProfile(fields) {
    const updatedUser = await api('/auth/profile/', { method: 'PATCH', body: JSON.stringify(fields) })
    setUser(updatedUser)
  }

  return <AuthContext.Provider value={{ user, loading, authError, login, register, logout, updateProfile }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
