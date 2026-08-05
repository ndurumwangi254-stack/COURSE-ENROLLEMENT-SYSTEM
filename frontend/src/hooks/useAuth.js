import { useEffect, useState } from 'react'

const API_BASE = '/api'

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!token)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        const data = await res.json()
        if (cancelled) return
        if (!res.ok) {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
          setError(data.message || 'Session expired')
          return
        }
        setUser(data.user)
      })
      .catch(() => {
        if (cancelled) return
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setError('Unable to validate session')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const login = async (credentials) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Login failed')
        return { success: false, message: data.message }
      }
      localStorage.setItem('token', data.access_token)
      setToken(data.access_token)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      setError('Login failed')
      return { success: false, message: 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (values) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Registration failed')
        return { success: false, message: data.message }
      }
      return { success: true }
    } catch (err) {
      setError('Registration failed')
      return { success: false, message: 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setError('')
  }

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {}

  return {
    token,
    user,
    loading,
    error,
    authHeader,
    login,
    logout,
    register,
    setError,
    setToken
  }
}
