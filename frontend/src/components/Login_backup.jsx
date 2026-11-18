
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import API from '../api/axios'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await API.post('auth/login/', {
        username,
        password,
      })

      const accessToken = response.data.access
      const refreshToken = response.data.refresh

      const decoded = jwtDecode(accessToken)

      const loggedInUsername = decoded.username
      const loggedInRole = decoded.role

      if (!loggedInRole) {
        throw new Error('User role was not found in JWT token.')
      }

      if (loggedInRole !== role) {
        throw new Error(
          `This account is registered as ${loggedInRole}. Please select the correct role.`
        )
      }

      localStorage.setItem('access', accessToken)
      localStorage.setItem('refresh', refreshToken)
      localStorage.setItem('username', loggedInUsername)
      localStorage.setItem('role', loggedInRole)

      onLogin(loggedInUsername, loggedInRole)

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Invalid username or password.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <Link to="/" className="brand">
          <div className="brand-logo">M</div>
          <div>
            <strong>Mentor<span>Match</span></strong>
            <small>Learn. Prepare. Grow.</small>
          </div>
        </Link>

        <div className="nav-menu">
          <a href="#home">⌂ Home</a>
          <a href="#features">♟ Mentors</a>
          <a href="#about">ⓘ About</a>
          <a href="#contact">☎ Contact</a>
        </div>

        <div className="nav-actions">
          <a href="#login-card" className="login-nav">Login</a>
          <a href="#login-card" className="signup-nav">Sign Up</a>
        </div>
      </nav>

      {/* LOGIN PAGE */}
      <main className="login-page" id="home">

        {/* LEFT HERO SECTION */}
        <section className="hero-section">
          <div className="hero-content">

            <span className="hero-badge">
              ✨ Your Journey Starts Here
            </span>

            <h1>
              Learn from Experts.
              <br />
              Prepare for Success.
              <br />
              <span>Grow Your Future.</span>
            </h1>

            <p className="hero-description">
              Connect with experienced tech mentors, improve
              your skills and prepare for your dream career
              with personalized one-to-one mentorship.
            </p>

            <div className="features">

              <div className="feature">
                <div className="feature-icon">♟</div>
                <div>
                  <strong>Expert Tech Mentors</strong>
                  <small>Learn directly from industry professionals.</small>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">◷</div>
                <div>
                  <strong>Flexible Session Booking</strong>
                  <small>Schedule mentorship sessions at your convenience.</small>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">★</div>
                <div>
                  <strong>Mock Interview Practice</strong>
                  <small>Build confidence and prepare for your career.</small>
                </div>
              </div>

            </div>

            <div className="illustration-area">
              <div className="dream-bubble">
                Dream Big!
              </div>

              <div className="student-art">
                <span style={{ fontSize: 95 }}>👨‍💻</span>
                <span style={{ fontSize: 42, marginLeft: 15 }}>💡</span>
              </div>
            </div>

          </div>
        </section>

        {/* RIGHT LOGIN SECTION */}
        <section className="login-section">

          <div className="login-card" id="login-card">

            <div className="login-logo">
              <div className="logo-symbol">M</div>

              <h2>
                Mentor<span>Match</span>
              </h2>

              <p>Welcome back! Login to continue.</p>
            </div>

            {/* ROLE SELECTOR */}
            <div className="role-selector">

              {[
                { value: 'student', label: '🎓 Student' },
                { value: 'mentor', label: '👨‍🏫 Mentor' },
                { value: 'admin', label: '⚙ Admin' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`role-option ${
                    role === item.value ? 'active' : ''
                  }`}
                  onClick={() => setRole(item.value)}
                >
                  {item.label}
                </button>
              ))}

            </div>

            {/* LOGIN FORM */}
            <form className="login-form" onSubmit={handleSubmit}>

              <div className="input-wrap">
                <span>♙</span>

                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="input-wrap">
                <span>♙</span>

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="form-options">

                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>

                <span className="forgot-text">
                  Forgot password?
                </span>

              </div>

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login to Account →'}
              </button>

            </form>

            <div className="register-prompt">
              Don't have an account?
              <Link to="/register">Create Account</Link>
            </div>

          </div>

        </section>

      </main>
    </>
  )
}

export default Login;
