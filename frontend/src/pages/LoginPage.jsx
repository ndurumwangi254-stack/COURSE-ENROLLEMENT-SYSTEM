import { useState } from 'react'

export default function LoginPage({ setToken, setUser }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.message || 'Login failed')
      return
    }

    localStorage.setItem('token', data.access_token)
    setToken(data.access_token)
    setUser(data.user)
    window.location.href = '/'
  }

  return (
    <div className="page">
      <h1>Course Enrollment System</h1>
      <form onSubmit={handleSubmit} className="card">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
      </form>
    </div>
  )
}
