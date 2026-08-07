import { useEffect, useMemo, useState } from 'react'
import { useFetch } from '../hooks/useFetch'

export default function DashboardPage({ auth }) {
  const token = auth.token
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])
  const API_BASE = import.meta.env.VITE_API_URL || ''
  const [form, setForm] = useState({ title: '', description: '', grade_requirements: '', cost: '', duration: '' })
  const [tutorForm, setTutorForm] = useState({ username: '', email: '', password: '', full_name: '', bio: '' })
  const [adminUsers, setAdminUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [studentList, setStudentList] = useState([])
  const [stats, setStats] = useState(null)
  const [message, setMessage] = useState('')
  const [switchTargets, setSwitchTargets] = useState({})

  const { data: courseData, loading: loadingCourses, error: courseError, refetch: reloadCourses } = useFetch(`${API_BASE}/courses`, { headers }, [token])
  const { data: enrollmentData, loading: loadingEnrollments, error: enrollError, refetch: reloadEnrollments } = useFetch(`${API_BASE}/enrollments`, { headers }, [token])

  const reloadUsers = async () => {
    if (!token || auth.user?.role !== 'admin') return
    setLoadingUsers(true)
    const res = await fetch(`${API_BASE}/admin/users?role=tutor`, { headers })
    const data = await res.json()
    if (res.ok) {
      setAdminUsers(data.users)
    }
    setLoadingUsers(false)
  }

  const courses = courseData?.courses || []
  const enrollments = enrollmentData?.enrollments || []
  const enrolledCourseIds = useMemo(() => enrollments.map((item) => item.course_id), [enrollments])
  const availableCourses = useMemo(
    () => courses.filter((course) => !enrolledCourseIds.includes(course.id)),
    [courses, enrolledCourseIds]
  )
  const visibleCourses = auth.user?.role === 'student' ? availableCourses : courses

  useEffect(() => {
    if (!token) return
    reloadCourses()
    reloadEnrollments()
    reloadUsers()
  }, [token])

  useEffect(() => {
    if (!API_BASE) return

    fetch(`${API_BASE}/courses`)
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error('Failed to fetch courses from VITE_API_URL', err))
  }, [])

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    setMessage('')
    const res = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ ...form, cost: form.cost ? Number(form.cost) : 0 })
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.message || 'Unable to create course')
      return
    }
    setForm({ title: '', description: '', grade_requirements: '', cost: '', duration: '' })
    setMessage('Course created successfully')
    reloadCourses()
  }

  const handleEnroll = async (courseId) => {
    const res = await fetch(`${API_BASE}/enrollments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ course_id: courseId })
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.message || 'Unable to enroll')
      return
    }
    setMessage('Enrolled successfully')
    reloadEnrollments()
    reloadCourses()
  }

  const handleSwitchCourse = async (enrollmentId, courseId) => {
    if (!courseId) return
    const res = await fetch(`${API_BASE}/enrollments/${enrollmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ course_id: courseId })
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.message || 'Unable to switch course')
      return
    }
    setMessage('Course switched successfully')
    setSwitchTargets((prev) => ({ ...prev, [enrollmentId]: '' }))
    reloadEnrollments()
    reloadCourses()
  }

  const handleViewStudents = async (course) => {
    setSelectedCourse(course)
    const res = await fetch(`${API_BASE}/courses/${course.id}/students`, { headers })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.message || 'Unable to load students')
      return
    }
    setStudentList(data)
  }

  const handleViewStats = async (course) => {
    const res = await fetch(`${API_BASE}/courses/${course.id}/stats`, { headers })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.message || 'Unable to load stats')
      return
    }
    setStats(data)
  }

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return
    }
    const res = await fetch(`${API_BASE}/courses/${courseId}`, {
      method: 'DELETE',
      headers
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.message || 'Unable to delete course')
      return
    }
    setMessage('Course deleted')
    reloadCourses()
  }

  const handleAddTutor = async (e) => {
    e.preventDefault()
    setMessage('')
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ ...tutorForm, role: 'tutor' })
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.message || 'Unable to add tutor')
      return
    }
    setTutorForm({ username: '', email: '', password: '', full_name: '', bio: '' })
    setMessage('Tutor added successfully')
    reloadUsers()
  }

  const handleDeleteTutor = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this tutor?')) {
      return
    }
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.message || 'Unable to delete tutor')
      return
    }
    setMessage('Tutor deleted successfully')
    reloadUsers()
  }

  const handleLogout = () => {
    auth.logout()
  }

  return (
    <div className="page dashboard-page">
      <header className="topbar">
        <div>
          <p className="subtitle">Role: {auth.user?.role || 'guest'}</p>
          <h1>Welcome, {auth.user?.username || 'Learner'}</h1>
        </div>
        <button className="ghost-button" onClick={handleLogout}>Logout</button>
      </header>

      {message && <p className="success">{message}</p>}
      {(courseError || enrollError) && <p className="error">{courseError || enrollError}</p>}

      {(auth.user?.role === 'tutor' || auth.user?.role === 'admin') && (
        <section className="card section-card">
          <h2>Create a New Course</h2>
          <form onSubmit={handleCreateCourse} className="form-grid">
            <input placeholder="Course title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea placeholder="Course description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input placeholder="Grade requirements (e.g. B+, >=70)" value={form.grade_requirements} onChange={(e) => setForm({ ...form, grade_requirements: e.target.value })} />
            <input type="number" step="0.01" placeholder="Course cost (USD)" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            <input placeholder="Duration (e.g. 8 weeks)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <button type="submit">Create Course</button>
          </form>
        </section>
      )}

      {auth.user?.role === 'admin' && (
        <section className="card section-card">
          <h2>Manage Tutors</h2>
          <form onSubmit={handleAddTutor} className="form-grid">
            <input placeholder="Username" value={tutorForm.username} onChange={(e) => setTutorForm({ ...tutorForm, username: e.target.value })} />
            <input placeholder="Email" value={tutorForm.email} onChange={(e) => setTutorForm({ ...tutorForm, email: e.target.value })} />
            <input type="password" placeholder="Password" value={tutorForm.password} onChange={(e) => setTutorForm({ ...tutorForm, password: e.target.value })} />
            <input placeholder="Full Name" value={tutorForm.full_name} onChange={(e) => setTutorForm({ ...tutorForm, full_name: e.target.value })} />
            <textarea placeholder="Bio" value={tutorForm.bio} onChange={(e) => setTutorForm({ ...tutorForm, bio: e.target.value })} />
            <button type="submit">Add Tutor</button>
          </form>

          <div className="section-header">
            <h3>Existing Tutors</h3>
            {loadingUsers && <span className="small-note">Loading tutors…</span>}
          </div>
          {adminUsers.length === 0 ? (
            <p>No tutors found.</p>
          ) : (
            <div className="grid-list">
              {adminUsers.map((user) => (
                <article key={user.id} className="course-card">
                  <div className="course-header">
                    <div>
                      <h3>{user.username}</h3>
                      <p>{user.email}</p>
                    </div>
                    <button onClick={() => handleDeleteTutor(user.id)}>Delete Tutor</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="card section-card">
        <div className="section-header">
          <h2>Available Courses</h2>
          {loadingCourses && <span className="small-note">Loading courses…</span>}
        </div>
        {visibleCourses.length === 0 && !loadingCourses ? (
          <p>{auth.user?.role === 'student' ? 'No available courses to enroll in right now.' : 'No courses available yet.'}</p>
        ) : (
          <div className="grid-list">
            {visibleCourses.map((course) => (
              <article key={course.id} className="course-card">
                <div className="course-header">
                  <h3>{course.title}</h3>
                  <span className="pill">Tutor: {course.teacher?.username || 'N/A'}</span>
                </div>
                <p>{course.description}</p>
                <p><strong>Requirements:</strong> {course.grade_requirements || 'None'}</p>
                <p><strong>Cost:</strong> {'$' + (course.cost != null ? Number(course.cost).toFixed(2) : '0.00')}</p>
                <p><strong>Duration:</strong> {course.duration || 'TBD'}</p>
                <div className="course-actions">
                  {(auth.user?.role !== 'student') && (
                    <>
                      <button onClick={() => handleViewStudents(course)}>Students</button>
                      <button onClick={() => handleViewStats(course)}>Stats</button>
                    </>
                  )}
                  <button disabled={enrolledCourseIds.includes(course.id)} onClick={() => handleEnroll(course.id)}>
                    {enrolledCourseIds.includes(course.id) ? 'Enrolled' : 'Enroll'}
                  </button>
                  {(auth.user?.role === 'tutor' || auth.user?.role === 'admin') && (
                    <button onClick={() => handleDeleteCourse(course.id)}>Delete Course</button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="card section-card">
        <h2>Your Enrollments</h2>
        {loadingEnrollments && <p>Loading your enrollments…</p>}
        {!loadingEnrollments && enrollments.length === 0 && <p>You have not enrolled in any courses yet.</p>}
        <div className="enrollment-list">
          {enrollments.map((enrollment) => {
            const alternatives = availableCourses
            const selectedSwitchId = switchTargets[enrollment.id] || (alternatives[0] && alternatives[0].id)
            return (
              <div key={enrollment.id} className="item enrollment-item">
                <div>
                  <strong>{enrollment.course?.title || `Course ${enrollment.course_id}`}</strong>
                  <p>Grade: {enrollment.grade ?? 'Pending'}</p>
                </div>
                <div className="enrollment-actions">
                  <span className="small-note">{new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                  {auth.user?.role === 'student' && (
                    <div className="switch-course">
                      {alternatives.length > 0 ? (
                        <>
                          <select
                            value={selectedSwitchId || ''}
                            onChange={(e) => setSwitchTargets((prev) => ({ ...prev, [enrollment.id]: Number(e.target.value) }))}
                          >
                            {alternatives.map((course) => (
                              <option key={course.id} value={course.id}>
                                {course.title}
                              </option>
                            ))}
                          </select>
                          <button
                            disabled={!selectedSwitchId}
                            onClick={() => handleSwitchCourse(enrollment.id, selectedSwitchId)}
                          >
                            Switch Course
                          </button>
                        </>
                      ) : (
                        <p className="small-note">No alternative courses available.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {selectedCourse && (
        <section className="card section-card">
          <h2>Students in {selectedCourse.title}</h2>
          {studentList.length === 0 ? <p>No students enrolled yet.</p> : (
            <ul className="student-list">
              {studentList.map((student) => (
                <li key={student.id}>{student.username} — {student.email}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {stats && (
        <section className="card section-card">
          <h2>{stats.title} Statistics</h2>
          <p>Students enrolled: {stats.student_count}</p>
          <p>Average grade: {stats.average_grade}</p>
        </section>
      )}
    </div>
  )
}
