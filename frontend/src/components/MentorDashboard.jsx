import { useState, useEffect } from 'react'
import './MentorDashboard.css'
import NotificationBell from './NotificationBell'

function MentorDashboard({
  username = 'Mentor',
  bookings = [],
  bookingLoading = false,
  onLogout = () => {},
  onUpdateBookingStatus = () => {},
  notifications = [],
  notificationLoading = false,
  onMarkNotificationRead = () => {},

  // AVAILABILITY PROPS
  availabilities = [],
  availabilityLoading = false,
  availabilityError = '',
  availabilityMessage = '',
  onAddAvailability = () => {},
  onUpdateAvailability = () => {},
  onDeleteAvailability = () => {}
}) {

  const [processingBookingId, setProcessingBookingId] = useState(null)
  const [actionError, setActionError] = useState('')

  const [availabilityForm, setAvailabilityForm] = useState({
    date: '',
    start_time: '',
    end_time: ''
  })

  const [editingAvailabilityId, setEditingAvailabilityId] = useState(null)
  const [availabilitySubmitting, setAvailabilitySubmitting] = useState(false)
  const [availabilityActionError, setAvailabilityActionError] = useState('')

  // =================================
  // BOOKING STATISTICS
  // =================================

  const totalSessions = bookings.length

  const pendingBookings = bookings.filter(
    item => item.status?.toLowerCase() === 'pending'
  )

  const completedBookings = bookings.filter(
    item => item.status?.toLowerCase() === 'completed'
  )

  const upcomingSessions = bookings
    .filter(item =>
      item.status?.toLowerCase() === 'confirmed' &&
      item.date >= getToday()
    )
    .sort((a, b) => {
      const dateA = `${a.date}T${a.start_time}`
      const dateB = `${b.date}T${b.start_time}`
      return dateA.localeCompare(dateB)
    })

  const unreadNotificationCount = notifications.filter(
    item => !item.is_read
  ).length

  // =================================
  // DATE HELPERS
  // =================================

  function getToday() {
    const date = new Date()

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-')
  }

  const today = getToday()

  const formatDate = date => {
    if (!date) return 'N/A'

    return new Date(date + 'T00:00:00').toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    )
  }

  const formatTime = time => {
    return time ? time.slice(0, 5) : 'N/A'
  }

  // =================================
  // BOOKING STATUS UPDATE
  // =================================

  const handleBookingAction = async (bookingId, status) => {

    if (processingBookingId !== null) return

    setActionError('')

    try {
      setProcessingBookingId(bookingId)

      await onUpdateBookingStatus(bookingId, status)

    } catch (error) {

      console.error('Booking update failed:', error)

      setActionError(
        error?.message ||
        'Booking status update failed. Please try again.'
      )

    } finally {
      setProcessingBookingId(null)
    }
  }

  // =================================
  // AVAILABILITY FORM CHANGE
  // =================================

  const handleAvailabilityChange = (e) => {

    const { name, value } = e.target

    setAvailabilityForm(previous => ({
      ...previous,
      [name]: value
    }))

    setAvailabilityActionError('')
  }

  // =================================
  // RESET AVAILABILITY FORM
  // =================================

  const resetAvailabilityForm = () => {

    setAvailabilityForm({
      date: '',
      start_time: '',
      end_time: ''
    })

    setEditingAvailabilityId(null)
    setAvailabilityActionError('')
  }

  // =================================
  // ADD / UPDATE AVAILABILITY
  // =================================

  const handleAvailabilitySubmit = async (e) => {

    e.preventDefault()

    if (availabilitySubmitting) return

    const { date, start_time, end_time } = availabilityForm

    if (!date || !start_time || !end_time) {
      setAvailabilityActionError('Please complete all fields.')
      return
    }

    if (date < today) {
      setAvailabilityActionError('You cannot select a past date.')
      return
    }

    if (start_time >= end_time) {
      setAvailabilityActionError('End time must be later than start time.')
      return
    }

    // FRONTEND OVERLAP VALIDATION
    const overlapping = availabilities.some(item => {

      if (item.id === editingAvailabilityId) return false

      return (
        item.date === date &&
        start_time < item.end_time &&
        end_time > item.start_time
      )
    })

    if (overlapping) {
      setAvailabilityActionError(
        'This time overlaps with an existing availability.'
      )
      return
    }

    try {

      setAvailabilitySubmitting(true)
      setAvailabilityActionError('')

      if (editingAvailabilityId) {

        await onUpdateAvailability(
          editingAvailabilityId,
          {
            date,
            start_time,
            end_time
          }
        )

      } else {

        await onAddAvailability({
          date,
          start_time,
          end_time,
          is_available: true
        })
      }

      resetAvailabilityForm()

    } catch (error) {

      console.error('Availability save failed:', error)

      setAvailabilityActionError(
        error?.message || 'Unable to save availability.'
      )

    } finally {
      setAvailabilitySubmitting(false)
    }
  }

  // =================================
  // EDIT AVAILABILITY
  // =================================

  const handleEditAvailability = (item) => {

    setEditingAvailabilityId(item.id)

    setAvailabilityForm({
      date: item.date,
      start_time: item.start_time?.slice(0, 5) || '',
      end_time: item.end_time?.slice(0, 5) || ''
    })

    setAvailabilityActionError('')

    document.getElementById('availability-form')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }

  // =================================
  // DELETE AVAILABILITY
  // =================================

  const handleDeleteAvailability = async (id) => {

    if (availabilitySubmitting) return

    const confirmed = window.confirm(
      'Are you sure you want to delete this availability?'
    )

    if (!confirmed) return

    try {

      setAvailabilitySubmitting(true)
      setAvailabilityActionError('')

      await onDeleteAvailability(id)

      if (editingAvailabilityId === id) {
        resetAvailabilityForm()
      }

    } catch (error) {

      console.error('Availability delete failed:', error)

      setAvailabilityActionError(
        error?.message || 'Unable to delete availability.'
      )

    } finally {
      setAvailabilitySubmitting(false)
    }
  }

  // =================================
  // DASHBOARD
  // =================================

  return (
    <div className="mentor-dashboard">

      {/* SIDEBAR */}

      <aside className="mentor-sidebar">

        <div className="mentor-brand">
          <span className="mentor-brand-icon">M</span>
          <h2>MentorMatch</h2>
        </div>

        <p className="sidebar-label">MENTOR WORKSPACE</p>

        <div className="sidebar-active">
          <span>▦</span>
          Dashboard
        </div>

        <button
          className="sidebar-logout"
          onClick={onLogout}
        >
          ↪ Logout
        </button>

      </aside>

      {/* MAIN CONTENT */}

      <main className="mentor-main">

        {/* HEADER */}

        <header className="mentor-header">

          <div>
            <p className="workspace-label">
              Workspace / Dashboard
            </p>

            <h1>Mentor Dashboard</h1>
          </div>

          <div className="mentor-user">

            <NotificationBell
              notifications={notifications}
              notificationLoading={notificationLoading}
              onMarkNotificationRead={onMarkNotificationRead}
            />

            <div className="mentor-avatar">
              {username?.charAt(0).toUpperCase() || 'M'}
            </div>

            <span>{username}</span>

          </div>

        </header>

        {/* WELCOME */}

        <section className="mentor-welcome">

          <div>
            <p className="welcome-small">MENTOR PORTAL</p>

            <h2>Welcome back, {username}!</h2>

            <p>
              Manage your mentorship activities and help
              students achieve their career goals.
            </p>
          </div>

          <div className="welcome-icon">👨‍🏫</div>

        </section>

        {/* STATISTICS */}

        <section className="mentor-stats">

          <div className="stat-card">
            <span>📚</span>
            <p>Total Sessions</p>
            <h2>{totalSessions}</h2>
            <small>All mentorship sessions</small>
          </div>

          <div className="stat-card">
            <span>⏳</span>
            <p>Pending Requests</p>
            <h2>{pendingBookings.length}</h2>
            <small>Waiting for your response</small>
          </div>

          <div className="stat-card">
            <span>✓</span>
            <p>Completed Sessions</p>
            <h2>{completedBookings.length}</h2>
            <small>Successfully completed</small>
          </div>

          <div className="stat-card">
            <span>📅</span>
            <p>Upcoming Sessions</p>
            <h2>{upcomingSessions.length}</h2>
            <small>Your scheduled sessions</small>
          </div>

        </section>

        {/* BOOKING ERROR */}

        {actionError && (
          <div className="booking-error">
            {actionError}
          </div>
        )}

        {/* PENDING BOOKINGS */}

        <section className="mentor-section">

          <div className="section-heading">
            <div>
              <h2>Pending Booking Requests</h2>
              <p>Review and manage student booking requests.</p>
            </div>

            <span>⏳</span>
          </div>

          {bookingLoading ? (

            <p className="empty-message">
              Loading booking requests...
            </p>

          ) : pendingBookings.length === 0 ? (

            <div className="empty-state">
              <span>📭</span>
              <h3>No Pending Requests</h3>
              <p>New student booking requests will appear here.</p>
            </div>

          ) : (

            <div className="session-list">

              {pendingBookings.map(item => {

                const isProcessing = processingBookingId === item.id

                return (
                  <div
                    className="session-card pending-booking-card"
                    key={item.id}
                  >

                    <div className="session-details">

                      <h3>
                        {item.student_username ||
                          item.student_name ||
                          `Student #${item.student}`}
                      </h3>

                      <div className="session-meta">
                        <span>📅 {formatDate(item.date)}</span>

                        <span>
                          🕒 {formatTime(item.start_time)}
                          {' - '}
                          {formatTime(item.end_time)}
                        </span>
                      </div>

                    </div>

                    <div className="booking-actions">

                      <span className="status-pending">
                        Pending
                      </span>

                      <button
                        className="booking-accept-btn"
                        disabled={processingBookingId !== null}
                        onClick={() =>
                          handleBookingAction(item.id, 'confirmed')
                        }
                      >
                        {isProcessing ? 'Processing...' : '✓ Accept'}
                      </button>

                      <button
                        className="booking-reject-btn"
                        disabled={processingBookingId !== null}
                        onClick={() =>
                          handleBookingAction(item.id, 'cancelled')
                        }
                      >
                        {isProcessing ? 'Processing...' : '✕ Reject'}
                      </button>

                    </div>

                  </div>
                )
              })}

            </div>
          )}

        </section>

        {/* UPCOMING SESSIONS */}

        <section className="mentor-section">

          <div className="section-heading">
            <div>
              <h2>Upcoming Sessions</h2>
              <p>Your next mentorship meetings.</p>
            </div>
          </div>

          {bookingLoading ? (

            <p className="empty-message">Loading sessions...</p>

          ) : upcomingSessions.length === 0 ? (

            <div className="empty-state">
              <span>📅</span>
              <h3>No Upcoming Sessions</h3>
              <p>Your upcoming mentorship sessions will appear here.</p>
            </div>

          ) : (

            <div className="session-list">

              {upcomingSessions.map(item => {

                const isProcessing = processingBookingId === item.id

                return (
                  <div className="session-card" key={item.id}>

                    <div className="session-details">

                      <h3>
                        {item.student_username ||
                          item.student_name ||
                          `Student #${item.student}`}
                      </h3>

                      <div className="session-meta">
                        <span>📅 {formatDate(item.date)}</span>

                        <span>
                          🕒 {formatTime(item.start_time)}
                          {' - '}
                          {formatTime(item.end_time)}
                        </span>
                      </div>

                      {item.meeting_link && (
                        <a
                          href={item.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="meeting-link"
                        >
                          Join Meeting ↗
                        </a>
                      )}

                    </div>

                    <div className="booking-actions">

                      <span className="status-confirmed">
                        Confirmed
                      </span>

                      <button
                        className="booking-complete-btn"
                        disabled={processingBookingId !== null}
                        onClick={() =>
                          handleBookingAction(item.id, 'completed')
                        }
                      >
                        {isProcessing
                          ? 'Updating...'
                          : '✓ Mark as Completed'}
                      </button>

                    </div>

                  </div>
                )
              })}

            </div>
          )}

        </section>

        {/* COMPLETED SESSIONS */}

        <section className="mentor-section">

          <div className="section-heading">
            <div>
              <h2>Completed Sessions</h2>
              <p>Your successfully completed mentorship meetings.</p>
            </div>

            <span>✅</span>
          </div>

          {bookingLoading ? (

            <p className="empty-message">
              Loading completed sessions...
            </p>

          ) : completedBookings.length === 0 ? (

            <div className="empty-state">
              <span>🎓</span>
              <h3>No Completed Sessions Yet</h3>
              <p>Completed mentorship meetings will appear here.</p>
            </div>

          ) : (

            <div className="session-list">

              {completedBookings.map(item => (

                <div
                  className="session-card completed-session-card"
                  key={item.id}
                >

                  <div className="session-details">

                    <h3>
                      {item.student_username ||
                        item.student_name ||
                        `Student #${item.student}`}
                    </h3>

                    <div className="session-meta">
                      <span>📅 {formatDate(item.date)}</span>

                      <span>
                        🕒 {formatTime(item.start_time)}
                        {' - '}
                        {formatTime(item.end_time)}
                      </span>
                    </div>

                    <small>Booking #{item.id}</small>

                  </div>

                  <span className="status-completed">
                    ✓ Completed
                  </span>

                </div>

              ))}

            </div>
          )}

        </section>

        {/* MENTOR OVERVIEW */}

        <section className="mentor-section overview-section">

          <div className="section-heading">
            <div>
              <h2>Mentor Overview</h2>
              <p>Your workspace summary.</p>
            </div>

            <span className="overview-icon">👨‍🏫</span>
          </div>

          <div className="overview-grid">

            <div className="overview-item">
              <span>👤 Account Status</span>
              <strong className="account-active">Active</strong>
            </div>

            <div className="overview-item">
              <span>🎓 Role</span>
              <strong>Mentor</strong>
            </div>

            <div className="overview-item">
              <span>🪪 Username</span>
              <strong>{username}</strong>
            </div>

            <div className="overview-item">
              <span>🔔 Unread Notifications</span>
              <strong>{unreadNotificationCount}</strong>
            </div>

          </div>

        </section>

        {/* =================================
            AVAILABILITY MANAGEMENT
        ================================= */}

        <section className="mentor-section availability-section">

          <div className="section-heading">

            <div>
              <h2>Availability Management</h2>
              <p>Manage your available mentorship time slots.</p>
            </div>

            <span className="availability-clock">🕒</span>

          </div>

          {/* AVAILABILITY INFO */}

          <div className="availability-info">

            <div className="availability-info-card">
              <span className="availability-icon">📅</span>

              <div>
                <h3>Flexible Schedule</h3>
                <p>Manage your mentoring dates.</p>
              </div>
            </div>

            <div className="availability-info-card">
              <span className="availability-icon">⏰</span>

              <div>
                <h3>Time Slots</h3>
                <p>Set your preferred mentoring hours.</p>
              </div>
            </div>

            <div className="availability-info-card">
              <span className="availability-icon">🎯</span>

              <div>
                <h3>Booking Control</h3>
                <p>Keep your schedule organized.</p>
              </div>
            </div>

          </div>

          {/* AVAILABILITY FORM */}

          <div className="availability-form-container" id="availability-form">

            <div className="availability-form-heading">

              <div>
                <h3>
                  {editingAvailabilityId
                    ? 'Edit Availability'
                    : 'Add New Availability'}
                </h3>

                <p>
                  Select a date and set your mentoring hours.
                </p>
              </div>

              {editingAvailabilityId && (
                <button
                  type="button"
                  className="availability-cancel-btn"
                  onClick={resetAvailabilityForm}
                >
                  Cancel Edit
                </button>
              )}

            </div>

            <form
              className="availability-form"
              onSubmit={handleAvailabilitySubmit}
            >

              <div className="availability-input-group">

                <label htmlFor="availability-date">
                  Select Date
                </label>

                <input
                  id="availability-date"
                  type="date"
                  name="date"
                  min={today}
                  value={availabilityForm.date}
                  onChange={handleAvailabilityChange}
                  required
                  disabled={availabilitySubmitting}
                />

              </div>

              <div className="availability-input-group">

                <label htmlFor="availability-start">
                  Start Time
                </label>

                <input
                  id="availability-start"
                  type="time"
                  name="start_time"
                  value={availabilityForm.start_time}
                  onChange={handleAvailabilityChange}
                  required
                  disabled={availabilitySubmitting}
                />

              </div>

              <div className="availability-input-group">

                <label htmlFor="availability-end">
                  End Time
                </label>

                <input
                  id="availability-end"
                  type="time"
                  name="end_time"
                  value={availabilityForm.end_time}
                  onChange={handleAvailabilityChange}
                  required
                  disabled={availabilitySubmitting}
                />

              </div>

              <button
                type="submit"
                className="availability-submit-btn"
                disabled={availabilitySubmitting}
              >
                {availabilitySubmitting
                  ? 'Saving...'
                  : editingAvailabilityId
                    ? '✓ Update Availability'
                    : '+ Add Availability'}
              </button>

            </form>

            {availabilityActionError && (
              <div className="availability-error">
                {availabilityActionError}
              </div>
            )}

            {availabilityError && (
              <div className="availability-error">
                {availabilityError}
              </div>
            )}

            {availabilityMessage && (
              <div className="availability-success">
                {availabilityMessage}
              </div>
            )}

          </div>

          {/* AVAILABILITY LIST */}

          <div className="availability-list-container">

            <div className="availability-list-heading">

              <div>
                <h3>My Available Time Slots</h3>
                <p>
                  {availabilities.length} availability slot(s) found
                </p>
              </div>

              <span className="availability-count">
                {availabilities.length}
              </span>

            </div>

            {availabilityLoading ? (

              <div className="availability-empty">
                Loading your availability...
              </div>

            ) : availabilities.length === 0 ? (

              <div className="availability-empty">
                <span>📅</span>
                <h3>No Availability Added</h3>
                <p>
                  Add your first availability using the form above.
                </p>
              </div>

            ) : (

              <div className="availability-list">

                {[...availabilities]
                  .sort((a, b) => {
                    const dateCompare = a.date.localeCompare(b.date)

                    return dateCompare ||
                      a.start_time.localeCompare(b.start_time)
                  })
                  .map(item => (

                    <div
                      className="availability-item"
                      key={item.id}
                    >

                      <div className="availability-item-date">
                        <span>📅</span>

                        <div>
                          <strong>{formatDate(item.date)}</strong>
                          <small>Availability #{item.id}</small>
                        </div>
                      </div>

                      <div className="availability-item-time">
                        <span>🕒</span>

                        <strong>
                          {formatTime(item.start_time)}
                          {' - '}
                          {formatTime(item.end_time)}
                        </strong>
                      </div>

                      <span
                        className={
                          item.is_available
                            ? 'availability-active-badge'
                            : 'availability-inactive-badge'
                        }
                      >
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>

                      <div className="availability-item-actions">

                        <button
                          type="button"
                          className="availability-edit-btn"
                          disabled={availabilitySubmitting}
                          onClick={() => handleEditAvailability(item)}
                        >
                          ✎ Edit
                        </button>

                        <button
                          type="button"
                          className="availability-delete-btn"
                          disabled={availabilitySubmitting}
                          onClick={() => handleDeleteAvailability(item.id)}
                        >
                          ✕ Delete
                        </button>

                      </div>

                    </div>

                  ))}

              </div>

            )}

          </div>

          <div className="availability-footer">
            <p>Your schedule is connected to the booking system.</p>

            <span className="availability-note">
              Students can see your available time slots when booking a session.
            </span>
          </div>

        </section>

      </main>

    </div>
  )
}

export default MentorDashboard;