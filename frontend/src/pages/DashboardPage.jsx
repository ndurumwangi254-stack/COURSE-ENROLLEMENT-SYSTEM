import { useEffect, useState } from 'react'

export default function DashboardPage({ user, token }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', description: '' })
  const [enrollments, setEnrollments] = useState([])

  const fetchCourses = async () => {
    setLoading(true)
    const res = await fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.message || 'Failed to load courses')
      return
    }
    setCourses(data.courses || [])
  }

  const fetchEnrollments = async () => {
    const res = await fetch('/api/enrollments', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (res.ok) setEnrollments(data.enrollments || [])
  }

  useEffect(() => {
    fetchCourses()
    fetchEnrollments()
  }, [token])

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    })
    if (res.ok) {
      setForm({ title: '', description: '' })
      fetchCourses()
    }
  }

  const handleEnroll = async (courseId) => {
    const res = await fetch('/api/enrollments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ course_id: courseId })
    })
    if (res.ok) fetchEnrollments()
  }

  return (
    <div className="page">
      <h1>Welcome, {user?.username || 'student'}</h1>
      {error && <p className="error">{error}</p>}
      {user?.role !== 'student' && (
        <form onSubmit={handleCreateCourse} className="card">
          <h2>Create Course</h2>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button type="submit">Create</button>
        </form>
      )}

      <div className="card">
        <h2>Courses</h2>
        {loading ? <p>Loading...</p> : courses.map(course => (
          <div key={course.id} className="item">
            <strong>{course.title}</strong>
            <p>{course.description}</p>
            <button onClick={() => handleEnroll(course.id)}>Enroll</button>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Your Enrollments</h2>
        {enrollments.map(enrollment => <p key={enrollment.id}>Course {enrollment.course_id} — Grade: {enrollment.grade ?? 'Pending'}</p>)}
      </div>
    </div>
  )
}
