
import React, { useState, useEffect } from 'react'

const AdminDashboard = ({ onLogout }) => {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Production Backend API
  const API_URL = 'https://mentormatch-backend-w23v.onrender.com/api/auth'

  // Fetch Dashboard Statistics and Users
  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('access')

      if (!token) {
        throw new Error('Admin login required. Please login again.')
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }

      const [statsResponse, usersResponse] = await Promise.all([
        fetch(`${API_URL}/admin/dashboard-stats/`, { headers }),
        fetch(`${API_URL}/admin/users/`, { headers }),
      ])

      if (!statsResponse.ok) {
        throw new Error(`Statistics API Error: ${statsResponse.status}`)
      }

      if (!usersResponse.ok) {
        throw new Error(`Users API Error: ${usersResponse.status}`)
      }

      const statsData = await statsResponse.json()
      const usersData = await usersResponse.json()

      setStats(statsData)
      setUsers(usersData.users || [])

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  // Dashboard Statistics Cards
  const cards = stats ? [
    { title: 'Total Users', value: stats.total_users, icon: '👥' },
    { title: 'Total Students', value: stats.total_students, icon: '🎓' },
    { title: 'Total Mentors', value: stats.total_mentors, icon: '👨‍🏫' },
    { title: 'Total Admins', value: stats.total_admins, icon: '⚙️' },
    { title: 'Total Bookings', value: stats.total_bookings, icon: '📚' },
    { title: 'Pending Bookings', value: stats.pending_bookings, icon: '⏳' },
    { title: 'Confirmed Bookings', value: stats.confirmed_bookings, icon: '✅' },
    { title: 'Completed Bookings', value: stats.completed_bookings, icon: '🏆' },
    { title: 'Cancelled Bookings', value: stats.cancelled_bookings, icon: '❌' },
  ] : []

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f4f6fb',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: '250px',
          minWidth: '250px',
          background: '#192951',
          color: 'white',
          padding: '27px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100vh',
          boxSizing: 'border-box',
          position: 'sticky',
          top: 0,
        }}
      >
        <div>
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '42px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                background: '#6366f1',
                borderRadius: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '23px',
                fontWeight: 'bold',
              }}
            >
              M
            </div>

            <h2
              style={{
                fontSize: '20px',
                margin: 0,
                fontWeight: 'bold',
              }}
            >
              MentorMatch
            </h2>
          </div>

          {/* Workspace */}
          <p
            style={{
              color: '#a5b4cf',
              fontSize: '11px',
              fontWeight: 'bold',
              letterSpacing: '1.2px',
              marginLeft: '10px',
              marginBottom: '18px',
            }}
          >
            ADMIN WORKSPACE
          </p>

          {/* Dashboard Menu */}
          <div
            style={{
              background: '#3932a5',
              padding: '14px',
              borderRadius: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontWeight: 'bold',
            }}
          >
            <span>▦</span>
            <span>Dashboard</span>
          </div>

          {/* Refresh Dashboard */}
          <button
            onClick={fetchDashboard}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '10px',
              background: 'transparent',
              color: 'white',
              border: '1px solid #405176',
              borderRadius: '11px',
              cursor: loading ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              fontSize: '14px',
              opacity: loading ? 0.6 : 1,
            }}
          >
            ↻ Refresh Dashboard
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            color: 'white',
            border: '1px solid #405176',
            borderRadius: '11px',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: '14px',
          }}
        >
          ↪ Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          padding: '30px',
          minWidth: 0,
          boxSizing: 'border-box',
        }}
      >
        <h1 style={{ color: '#192951' }}>
          Admin Dashboard
        </h1>

        <p style={{ color: '#64748b' }}>
          Welcome to MentorMatch Admin Panel
        </p>

        {/* Loading */}
        {loading && (
          <div
            style={{
              padding: '20px',
              background: 'white',
              borderRadius: '10px',
              marginTop: '20px',
            }}
          >
            <h2>Loading Admin Dashboard...</h2>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              background: '#fee2e2',
              padding: '20px',
              borderRadius: '10px',
              color: '#991b1b',
              marginTop: '20px',
            }}
          >
            <h3>Dashboard Error</h3>
            <p>{error}</p>

            <button
              onClick={fetchDashboard}
              style={{
                padding: '10px 20px',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Dashboard Data */}
        {!loading && !error && stats && (
          <>
            {/* Statistics Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginTop: '25px',
              }}
            >
              {cards.map((card, index) => (
                <div
                  key={index}
                  style={{
                    background: 'white',
                    padding: '25px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ fontSize: '30px' }}>
                    {card.icon}
                  </div>

                  <p style={{ color: '#64748b' }}>
                    {card.title}
                  </p>

                  <h2
                    style={{
                      fontSize: '30px',
                      margin: 0,
                      color: '#192951',
                    }}
                  >
                    {card.value}
                  </h2>
                </div>
              ))}
            </div>

            {/* User Management */}
            <div
              style={{
                background: 'white',
                padding: '25px',
                marginTop: '40px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              }}
            >
              <h2>User Management</h2>

              <p style={{ color: '#64748b' }}>
                Manage all registered MentorMatch users.
              </p>

              <h3>Total Users: {users.length}</h3>

              {/* Users Table */}
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    minWidth: '750px',
                  }}
                >
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={thStyle}>ID</th>
                      <th style={thStyle}>Username</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Role</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Joined Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td style={tdStyle}>{user.id}</td>
                        <td style={tdStyle}>{user.username}</td>
                        <td style={tdStyle}>{user.email || 'N/A'}</td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              padding: '5px 10px',
                              borderRadius: '20px',
                              background:
                                user.role === 'admin'
                                  ? '#ede9fe'
                                  : user.role === 'mentor'
                                    ? '#dbeafe'
                                    : '#dcfce7',
                              color:
                                user.role === 'admin'
                                  ? '#6d28d9'
                                  : user.role === 'mentor'
                                    ? '#1d4ed8'
                                    : '#15803d',
                            }}
                          >
                            {user.role.toUpperCase()}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              color: user.is_active ? 'green' : 'red',
                              fontWeight: 'bold',
                            }}
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          {new Date(user.date_joined).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}

                    {users.length === 0 && (
                      <tr>
                        <td colSpan="6" style={tdStyle}>
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

const thStyle = {
  padding: '14px',
  borderBottom: '1px solid #ddd',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  padding: '14px',
  borderBottom: '1px solid #eee',
}

export default AdminDashboard
