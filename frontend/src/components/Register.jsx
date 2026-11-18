
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axios'

function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student',
    university: '',
    education_level: '',
    expertise: '',
    experience_years: 0,
    bio: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    setLoading(true)

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        bio: formData.bio
      }

      if (formData.role === 'student') {
        payload.university = formData.university
        payload.education_level = formData.education_level
      }

      if (formData.role === 'mentor') {
        payload.expertise = formData.expertise
        payload.experience_years = Number(formData.experience_years)
      }

      await API.post('auth/register/', payload)

      setSuccess('Registration successful! Please login.')

      setTimeout(() => {
        navigate('/')
      }, 1500)

    } catch (err) {
      const data = err.response?.data

      if (data) {
        setError(
          Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join(' | ')
        )
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      maxWidth: '500px',
      margin: '40px auto',
      padding: '30px',
      background: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <h2>Create Your MentorMatch Account</h2>

      <form onSubmit={handleSubmit}>
        <label>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label>Password (minimum 8 characters)</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          minLength={8}
          required
          style={inputStyle}
        />

        <label>Select Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="student">Student</option>
          <option value="mentor">Mentor</option>
        </select>

        {formData.role === 'student' && (
          <>
            <label>University</label>
            <input
              type="text"
              name="university"
              value={formData.university}
              onChange={handleChange}
              style={inputStyle}
            />

            <label>Education Level</label>
            <input
              type="text"
              name="education_level"
              value={formData.education_level}
              onChange={handleChange}
              style={inputStyle}
            />
          </>
        )}

        {formData.role === 'mentor' && (
          <>
            <label>Expertise</label>
            <input
              type="text"
              name="expertise"
              value={formData.expertise}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <label>Experience Years</label>
            <input
              type="number"
              name="experience_years"
              value={formData.experience_years}
              onChange={handleChange}
              min="0"
              required
              style={inputStyle}
            />
          </>
        )}

        <label>Short Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows="3"
          style={inputStyle}
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '15px'
          }}
        >
          {loading ? 'Registering...' : 'Create Account'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  )
}

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '10px',
  margin: '6px 0 15px',
  border: '1px solid #ccc',
  borderRadius: '6px',
  boxSizing: 'border-box'
}

export default Register;
