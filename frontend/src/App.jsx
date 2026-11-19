
import './App.css'
import PaymentPage from './components/PaymentPage'
import Register from './components/Register'
import { useState, useEffect, useRef } from 'react'
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useLocation
} from 'react-router-dom'

import API from './api/axios'

import Login from './components/Login'
import StudentDashboard from './components/StudentDashboard'
import MentorDashboard from './components/MentorDashboard'
import BookingPage from './components/BookingPage'
import BookingSuccessPage from './components/BookingSuccessPage'
import AdminDashboard from './components/AdminDashboard'


// =============================================
// AUTH STORAGE HELPER
// =============================================

const getStoredAuth = (key) => {
  return localStorage.getItem(key) || sessionStorage.getItem(key)
}


// =============================================
// STUDENT DASHBOARD ROUTE
// =============================================

function StudentDashboardRoute(props) {

  const { section } = useParams()

  const allowedSections = [
    'overview',
    'profile',
    'mentors',
    'bookings',
    'notifications'
  ]

  if (!allowedSections.includes(section)) {
    return <Navigate to="/dashboard/overview" replace />
  }

  return (
    <StudentDashboard
      {...props}
      activeSection={section}
    />
  )
}


// =============================================
// PAYMENT PAGE ROUTE
// =============================================

function PaymentPageRoute() {

  const navigate = useNavigate()
  const location = useLocation()

  const booking = location.state?.booking
  const mentor = location.state?.mentor

  if (!booking) {
    return <Navigate to="/dashboard/bookings" replace />
  }

  const paymentBooking = {
    ...booking,
    mentor_name:
      mentor?.username ||
      mentor?.user?.username ||
      mentor?.name ||
      booking.mentor_username ||
      booking.mentor_name
  }

  return (
    <PaymentPage
      booking={paymentBooking}
      onBack={() => navigate('/dashboard/bookings')}
      onPaymentSuccess={(paymentData) => {
        console.log('Demo Payment:', paymentData)
      }}
    />
  )
}


// =============================================
// MAIN APP
// =============================================

function App() {

  const navigate = useNavigate()


  // =============================================
  // AUTHENTICATION
  // =============================================

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!getStoredAuth('access')
  )

  const [username, setUsername] = useState(
    getStoredAuth('username') || ''
  )

  const [role, setRole] = useState(
    getStoredAuth('role') || ''
  )


  // =============================================
  // BOOKING STATES
  // =============================================

  const [bookings, setBookings] = useState([])
  const [bookingLoading, setBookingLoading] = useState(false)

  const [booking, setBooking] = useState({
    date: '',
    start_time: '',
    end_time: ''
  })

  const [bookingError, setBookingError] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)


  // =============================================
  // NOTIFICATION STATES
  // =============================================

  const [notifications, setNotifications] = useState([])
  const [notificationLoading, setNotificationLoading] = useState(false)


  // =============================================
  // STUDENT PROFILE STATES
  // =============================================

  const [studentProfile, setStudentProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileUpdating, setProfileUpdating] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileMessage, setProfileMessage] = useState('')


  // =============================================
  // MENTOR STATES
  // =============================================

  const [mentors, setMentors] = useState([])
  const [mentorLoading, setMentorLoading] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [search, setSearch] = useState('')


  // =============================================
  // MENTOR AVAILABILITY STATES
  // =============================================

  const [availabilities, setAvailabilities] = useState([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')
  const [availabilityMessage, setAvailabilityMessage] = useState('')


  // =============================================
  // MENTOR SESSION FEE STATES
  // =============================================

  const [sessionFee, setSessionFee] = useState(null)
  const [sessionFeeLoading, setSessionFeeLoading] = useState(false)
  const [sessionFeeUpdating, setSessionFeeUpdating] = useState(false)
  const [sessionFeeError, setSessionFeeError] = useState('')
  const [sessionFeeMessage, setSessionFeeMessage] = useState('')


  // =============================================
  // AVAILABLE SLOTS
  // =============================================

  const [availableSlots, setAvailableSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState('')

  const slotsRequestId = useRef(0)


  // =============================================
  // TODAY'S DATE
  // =============================================

  const currentDate = new Date()

  const today = [
    currentDate.getFullYear(),
    String(currentDate.getMonth() + 1).padStart(2, '0'),
    String(currentDate.getDate()).padStart(2, '0')
  ].join('-')


  // =============================================
  // OPEN BOOKING PAGE
  // =============================================

  const openBooking = (mentor) => {

    if (!mentor || !mentor.id) {
      setBookingError('Mentor information not found.')
      return
    }

    slotsRequestId.current++

    setSlotsLoading(false)
    setSelectedMentor(mentor)

    setBooking({
      date: '',
      start_time: '',
      end_time: ''
    })

    setAvailableSlots([])
    setSlotsError('')
    setBookingError('')
    setBookingMessage('')

    navigate(`/booking/${mentor.id}`)
  }


  // =============================================
  // CLOSE BOOKING PAGE
  // =============================================

  const closeBooking = () => {

    if (submitting) return

    slotsRequestId.current++

    setSlotsLoading(false)
    setSelectedMentor(null)

    setBooking({
      date: '',
      start_time: '',
      end_time: ''
    })

    setAvailableSlots([])
    setSlotsError('')
    setBookingError('')
    setBookingMessage('')

    navigate('/dashboard/mentors')
  }


  // =============================================
  // HANDLE BOOKING CHANGE
  // =============================================

  const handleBookingChange = async (e) => {

    const { name, value } = e.target

    setBooking((previous) => ({
      ...previous,
      [name]: value,

      ...(name === 'date'
        ? {
          start_time: '',
          end_time: ''
        }
        : {})
    }))

    setBookingError('')
    setBookingMessage('')

    if (name !== 'date') return

    const requestId = ++slotsRequestId.current

    setAvailableSlots([])
    setSlotsError('')

    if (!value) {
      setSlotsLoading(false)
      return
    }

    if (!selectedMentor?.id) {
      setSlotsError('Mentor ID not found.')
      setSlotsLoading(false)
      return
    }

    try {

      setSlotsLoading(true)

      const response = await API.get(
        `auth/mentors/${selectedMentor.id}/available-slots/`,
        {
          params: {
            date: value
          }
        }
      )

      if (requestId !== slotsRequestId.current) return

      setAvailableSlots(
        response.data.available_slots || []
      )

    } catch (error) {

      if (requestId !== slotsRequestId.current) return

      console.error(
        'Available Slots Error:',
        error.response?.data || error.message
      )

      setSlotsError(
        error.response?.data?.detail ||
        'Unable to load available slots.'
      )

    } finally {

      if (requestId === slotsRequestId.current) {
        setSlotsLoading(false)
      }
    }
  }


  // =============================================
  // HANDLE SLOT SELECT
  // =============================================

  const handleSlotSelect = (slot) => {

    setBooking((previous) => ({
      ...previous,
      start_time: slot.start_time,
      end_time: slot.end_time
    }))

    setBookingError('')
    setBookingMessage('')
  }


  // =============================================
  // FETCH BOOKINGS
  // =============================================

  const fetchBookings = async () => {

    if (!getStoredAuth('access')) {
      setBookings([])
      return
    }

    try {

      setBookingLoading(true)

      const response = await API.get('bookings/list/')

      const data = response.data

      const bookingList = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
          ? data.results
          : []

      setBookings(bookingList)

    } catch (error) {

      console.error(
        'Booking loading error:',
        error.response?.data || error.message
      )

      setBookings([])

    } finally {

      setBookingLoading(false)
    }
  }


  // =============================================
  // FETCH NOTIFICATIONS
  // =============================================

  const fetchNotifications = async () => {

    if (!getStoredAuth('access')) {
      setNotifications([])
      return
    }

    try {

      setNotificationLoading(true)

      const response = await API.get('notifications/')

      const data = response.data

      const notificationList = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
          ? data.results
          : Array.isArray(data.value)
            ? data.value
            : []

      setNotifications(notificationList)

    } catch (error) {

      console.error(
        'Notification loading error:',
        error.response?.data || error.message
      )

      setNotifications([])

    } finally {

      console.log('Notification loading finished')

      setNotificationLoading(false)
    }
  }


  // =============================================
  // FETCH STUDENT PROFILE
  // =============================================

  const fetchStudentProfile = async () => {

    if (!getStoredAuth('access')) {
      setStudentProfile(null)
      return
    }

    try {

      setProfileLoading(true)
      setProfileError('')

      const response = await API.get(
        'auth/student/profile/'
      )

      setStudentProfile(response.data)

    } catch (error) {

      console.error(
        'Student Profile Error:',
        error.response?.data || error.message
      )

      setProfileError(
        error.response?.data?.detail ||
        'Unable to load student profile.'
      )

    } finally {

      setProfileLoading(false)
    }
  }


  // =============================================
  // UPDATE STUDENT PROFILE
  // =============================================

  const updateStudentProfile = async (profileData) => {

    try {

      setProfileUpdating(true)
      setProfileError('')
      setProfileMessage('')

      const response = await API.patch(
        'auth/student/profile/',
        profileData
      )

      setStudentProfile(response.data)

      setProfileMessage('Profile updated successfully!')

      return response.data

    } catch (error) {

      console.error(
        'Profile update error:',
        error.response?.data || error.message
      )

      const errorData = error.response?.data

      const message = errorData
        ? Object.entries(errorData)
          .map(([key, value]) =>
            `${key}: ${Array.isArray(value)
              ? value.join(', ')
              : String(value)
            }`
          )
          .join(' | ')
        : 'Unable to update profile.'

      setProfileError(message)

      throw error

    } finally {

      setProfileUpdating(false)
    }
  }


  // =============================================
  // MARK NOTIFICATION AS READ
  // =============================================

  const markNotificationRead = async (notificationId) => {

    try {

      await API.patch(
        `notifications/${notificationId}/read/`
      )

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? {
              ...notification,
              is_read: true
            }
            : notification
        )
      )

    } catch (error) {

      console.error(
        'Mark notification read error:',
        error.response?.data || error.message
      )

      throw error
    }
  }


  // =============================================
  // UPDATE BOOKING STATUS
  // =============================================

  const updateBookingStatus = async (bookingId, newStatus) => {

    const allowedStatuses = [
      'confirmed',
      'cancelled',
      'completed'
    ]

    if (!allowedStatuses.includes(newStatus)) {
      throw new Error('Invalid booking status.')
    }

    try {

      const response = await API.patch(
        `bookings/${bookingId}/status/`,
        {
          status: newStatus
        }
      )

      setBookings(previous =>
        previous.map(item =>
          item.id === bookingId
            ? {
              ...item,
              ...response.data,
              status: newStatus
            }
            : item
        )
      )

      await fetchBookings()
      await fetchNotifications()

      return response.data

    } catch (error) {

      console.error(
        'Booking status update error:',
        error.response?.data || error.message
      )

      const errorData = error.response?.data

      const errorMessage = errorData
        ? typeof errorData === 'string'
          ? errorData
          : Object.entries(errorData)
            .map(([key, value]) =>
              `${key}: ${Array.isArray(value)
                ? value.join(', ')
                : typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value)
              }`
            )
            .join('\n')
        : 'Unable to update booking status.'

      throw new Error(errorMessage)
    }
  }


  // =============================================
  // FETCH MENTORS
  // =============================================

  const fetchMentors = async () => {

    if (!getStoredAuth('access')) {
      setMentors([])
      return
    }

    try {

      setMentorLoading(true)

      const response = await API.get('auth/mentors/')

      const data = response.data

      const mentorList = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
          ? data.results
          : Array.isArray(data.mentors)
            ? data.mentors
            : []

      setMentors(mentorList)

    } catch (error) {

      console.error(
        'Mentor loading error:',
        error.response?.data || error.message
      )

      setMentors([])

    } finally {

      setMentorLoading(false)
    }
  }


  // =============================================
  // FETCH MENTOR AVAILABILITIES
  // =============================================

  const fetchAvailabilities = async () => {

    if (!getStoredAuth('access')) {
      setAvailabilities([])
      return
    }

    try {

      setAvailabilityLoading(true)
      setAvailabilityError('')

      const response = await API.get('auth/mentor/availability/')

      const data = response.data

      const availabilityList = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
          ? data.results
          : []

      setAvailabilities(availabilityList)

    } catch (error) {

      console.error(
        'Availability loading error:',
        error.response?.data || error.message
      )

      setAvailabilityError(
        error.response?.data?.detail ||
        'Unable to load availability.'
      )

    } finally {

      setAvailabilityLoading(false)
    }
  }


  // =============================================
  // FETCH MENTOR SESSION FEE
  // =============================================

  const fetchSessionFee = async () => {

    if (!getStoredAuth('access')) {
      setSessionFee(null)
      return
    }

    try {

      setSessionFeeLoading(true)
      setSessionFeeError('')

      const response = await API.get(
        'payments/session-fee/'
      )

      setSessionFee(response.data)

    } catch (error) {

      console.error(
        'Session Fee Loading Error:',
        error.response?.data || error.message
      )

      setSessionFeeError(
        error.response?.data?.detail ||
        'Unable to load session fee.'
      )

    } finally {

      setSessionFeeLoading(false)

    }
  }


  // =============================================
  // UPDATE MENTOR SESSION FEE
  // =============================================

  const updateSessionFee = async (amount) => {

    try {

      setSessionFeeUpdating(true)
      setSessionFeeError('')
      setSessionFeeMessage('')

      const response = await API.patch(
        'payments/session-fee/',
        {
          amount: amount
        }
      )

      setSessionFee(response.data)

      setSessionFeeMessage(
        'Session fee updated successfully!'
      )

      return response.data

    } catch (error) {

      console.error(
        'Session Fee Update Error:',
        error.response?.data || error.message
      )

      const errorData = error.response?.data

      const message = errorData
        ? Object.entries(errorData)
          .map(([key, value]) =>
            `${key}: ${Array.isArray(value)
              ? value.join(', ')
              : String(value)
            }`
          )
          .join(' | ')
        : 'Unable to update session fee.'

      setSessionFeeError(message)

      throw new Error(message)

    } finally {

      setSessionFeeUpdating(false)

    }
  }


  // =============================================
  // ADD AVAILABILITY
  // =============================================

  const addAvailability = async (availabilityData) => {

    try {

      setAvailabilityError('')
      setAvailabilityMessage('')

      const response = await API.post(
        'auth/mentor/availability/',
        {
          ...availabilityData,
          is_available: true
        }
      )

      setAvailabilityMessage('Availability added successfully!')

      await fetchAvailabilities()

      return response.data

    } catch (error) {

      const errorData = error.response?.data

      const message = errorData
        ? Object.entries(errorData)
          .map(([key, value]) =>
            `${key}: ${Array.isArray(value)
              ? value.join(', ')
              : String(value)
            }`
          )
          .join(' | ')
        : error.message || 'Unable to add availability.'

      setAvailabilityError(message)

      throw new Error(message)
    }
  }


  // =============================================
  // UPDATE AVAILABILITY
  // =============================================

  const updateAvailability = async (availabilityId, availabilityData) => {

    try {

      setAvailabilityError('')
      setAvailabilityMessage('')

      const response = await API.patch(
        `auth/mentor/availability/${availabilityId}/`,
        availabilityData
      )

      setAvailabilityMessage('Availability updated successfully!')

      await fetchAvailabilities()

      return response.data

    } catch (error) {

      const errorData = error.response?.data

      const message = errorData
        ? Object.entries(errorData)
          .map(([key, value]) =>
            `${key}: ${Array.isArray(value)
              ? value.join(', ')
              : String(value)
            }`
          )
          .join(' | ')
        : error.message || 'Unable to update availability.'

      setAvailabilityError(message)

      throw new Error(message)
    }
  }


  // =============================================
  // DELETE AVAILABILITY
  // =============================================

  const deleteAvailability = async (availabilityId) => {

    try {

      setAvailabilityError('')
      setAvailabilityMessage('')

      await API.delete(
        `auth/mentor/availability/${availabilityId}/`
      )

      setAvailabilities(previous =>
        previous.filter(item => item.id !== availabilityId)
      )

      setAvailabilityMessage('Availability deleted successfully!')

    } catch (error) {

      const errorData = error.response?.data

      const message = errorData
        ? JSON.stringify(errorData)
        : error.message || 'Unable to delete availability.'

      setAvailabilityError(message)

      throw new Error(message)
    }
  }


  // =============================================
  // SUBMIT BOOKING
  // =============================================

  const submitBooking = async (e) => {

    e.preventDefault()

    if (submitting) return

    if (!selectedMentor) {
      setBookingError('Please select a mentor.')
      return
    }

    if (
      !booking.date ||
      !booking.start_time ||
      !booking.end_time
    ) {
      setBookingError('Please complete all booking fields.')
      return
    }

    if (booking.end_time <= booking.start_time) {
      setBookingError('End time must be after start time.')
      return
    }

    if (booking.date < today) {
      setBookingError('You cannot select a past date.')
      return
    }

    try {

      setSubmitting(true)
      setBookingError('')
      setBookingMessage('')

      const response = await API.post(
        'bookings/create/',
        {
          mentor: selectedMentor.id,
          date: booking.date,
          start_time: booking.start_time,
          end_time: booking.end_time
        }
      )

      const createdBooking = response.data

      if (!createdBooking || !createdBooking.id) {
        throw new Error(
          'Booking ID was not returned by the server.'
        )
      }

      await fetchBookings()

      navigate('/payment', {
        state: {
          booking: createdBooking,
          mentor: selectedMentor
        },
        replace: true
      })

    } catch (error) {

      console.error(
        'Booking submission error:',
        error.response?.data || error.message
      )

      const errorData = error.response?.data

      let errorMessage = 'Booking failed. Please try again.'

      if (errorData) {

        if (typeof errorData === 'string') {

          errorMessage = errorData

        } else {

          errorMessage = Object.entries(errorData)
            .map(([key, value]) =>
              `${key}: ${Array.isArray(value)
                ? value.join(', ')
                : typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value)
              }`
            )
            .join(' | ')
        }

      } else if (error.message) {

        errorMessage = error.message
      }

      setBookingError(errorMessage)

    } finally {

      setSubmitting(false)
    }
  }


  // =============================================
  // LOAD DATA AFTER LOGIN
  // =============================================

  useEffect(() => {

    if (!isAuthenticated) return

    fetchBookings()
    fetchMentors()
    fetchNotifications()

    if (role === 'student') {
      fetchStudentProfile()
    } else {
      setStudentProfile(null)
    }

    if (role === 'mentor') {
      fetchAvailabilities()
      fetchSessionFee()
    } else {
      setAvailabilities([])
      setSessionFee(null)
    }

  }, [isAuthenticated, role])


  // =============================================
  // AUTO REFRESH NOTIFICATIONS
  // =============================================

  useEffect(() => {

    if (!isAuthenticated) return

    const intervalId = setInterval(() => {
      fetchNotifications()
    }, 10000)

    return () => clearInterval(intervalId)

  }, [isAuthenticated])


  // =============================================
  // STUDENT BOOKING AUTO REFRESH
  // =============================================

  useEffect(() => {

    if (!isAuthenticated) return

    if (role !== 'student' && role !== 'mentor') return

    const intervalId = setInterval(() => {
      fetchBookings()
    }, 10000)

    return () => clearInterval(intervalId)

  }, [isAuthenticated, role])


  // =============================================
  // LOGIN
  // =============================================

  const handleLogin = (loggedInUsername, loggedInRole) => {

    setUsername(loggedInUsername)
    setRole(loggedInRole)

    setIsAuthenticated(true)

    navigate(
      loggedInRole === 'student'
        ? '/dashboard/overview'
        : '/dashboard'
    )
  }


  // =============================================
  // LOGOUT
  // =============================================

  const handleLogout = () => {

    slotsRequestId.current++

    setSlotsLoading(false)

      // Clear authentication from both storages
      ;['access', 'refresh', 'username', 'role'].forEach((key) => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })

    setBookings([])
    setNotifications([])
    setMentors([])
    setSelectedMentor(null)
    setSearch('')

    setAvailableSlots([])
    setSlotsError('')

    setBookingError('')
    setBookingMessage('')

    setBooking({
      date: '',
      start_time: '',
      end_time: ''
    })

    setStudentProfile(null)
    setProfileLoading(false)
    setProfileUpdating(false)
    setProfileError('')
    setProfileMessage('')

    setAvailabilities([])
    setAvailabilityLoading(false)
    setAvailabilityError('')
    setAvailabilityMessage('')

    setSessionFee(null)
    setSessionFeeLoading(false)
    setSessionFeeUpdating(false)
    setSessionFeeError('')
    setSessionFeeMessage('')

    setUsername('')
    setRole('')
    setIsAuthenticated(false)

    navigate('/login', { replace: true })
  }


  // =============================================
  // SECTION NAVIGATION
  // =============================================

  const goToSection = (sectionId) => {

    const allowedSections = [
      'overview',
      'profile',
      'mentors',
      'bookings',
      'notifications'
    ]

    if (!allowedSections.includes(sectionId)) {
      return
    }

    navigate(`/dashboard/${sectionId}`)
  }


  // =============================================
  // STUDENT DASHBOARD PROPS
  // =============================================

  const studentDashboardProps = {

    username,

    studentProfile,
    profileLoading,
    profileUpdating,
    profileError,
    profileMessage,
    onUpdateStudentProfile: updateStudentProfile,

    bookings,
    bookingLoading,

    mentors,
    mentorLoading,
    search,
    setSearch,

    selectedMentor,
    availableSlots,
    slotsLoading,
    slotsError,

    handleSlotSelect,
    openBooking,
    closeBooking,

    booking,
    handleBookingChange,
    submitBooking,

    bookingError,
    bookingMessage,
    submitting,

    today,
    onLogout: handleLogout,
    goToSection,

    notifications,
    notificationLoading,
    onMarkNotificationRead: markNotificationRead
  }


  // =============================================
  // APP ROUTES
  // =============================================

  return (

    <Routes>

      {/* LOGIN */}

      <Route
        path="/"
        element={
          isAuthenticated
            ? (
              <Navigate
                to={
                  role === 'student'
                    ? '/dashboard/overview'
                    : '/dashboard'
                }
                replace
              />
            )
            : <Login onLogin={handleLogin} />
        }
      />
      {/* LOGIN PAGE - /login */}

      <Route
        path="/login"
        element={
          isAuthenticated
            ? (
              <Navigate
                to={
                  role === 'student'
                    ? '/dashboard/overview'
                    : '/dashboard'
                }
                replace
              />
            )
            : <Login onLogin={handleLogin} />
        }
      />


      {/* BOOKING PAGE */}

      <Route
        path="/booking/:mentorId"
        element={
          isAuthenticated &&
            role === 'student' &&
            selectedMentor
            ? (
              <BookingPage
                selectedMentor={selectedMentor}
                booking={booking}
                handleBookingChange={handleBookingChange}
                availableSlots={availableSlots}
                slotsLoading={slotsLoading}
                slotsError={slotsError}
                handleSlotSelect={handleSlotSelect}
                bookingError={bookingError}
                bookingMessage={bookingMessage}
                submitting={submitting}
                today={today}
                onSubmit={submitBooking}
                onCancel={closeBooking}
              />
            )
            : <Navigate to="/dashboard/overview" replace />
        }
      />


      {/* BOOKING SUCCESS */}

      <Route
        path="/booking-success"
        element={
          isAuthenticated && role === 'student'
            ? <BookingSuccessPage />
            : <Navigate to="/" replace />
        }
      />


      {/* PAYMENT PAGE */}

      <Route
        path="/payment"
        element={
          isAuthenticated && role === 'student'
            ? <PaymentPageRoute />
            : <Navigate to="/" replace />
        }
      />


      {/* STUDENT SEPARATE PAGES */}

      <Route
        path="/dashboard/:section"
        element={
          isAuthenticated && role === 'student'
            ? (
              <StudentDashboardRoute
                {...studentDashboardProps}
              />
            )
            : <Navigate to="/" replace />
        }
      />


      {/* MAIN DASHBOARD */}

      <Route
        path="/dashboard"
        element={

          !isAuthenticated ? (

            <Navigate to="/" replace />

          ) : role === 'student' ? (

            <Navigate to="/dashboard/overview" replace />

          ) : role === 'mentor' ? (

            <MentorDashboard
              username={username}
              bookings={bookings}
              bookingLoading={bookingLoading}
              onLogout={handleLogout}
              onUpdateBookingStatus={updateBookingStatus}

              notifications={notifications}
              notificationLoading={notificationLoading}
              onMarkNotificationRead={markNotificationRead}

              availabilities={availabilities}
              availabilityLoading={availabilityLoading}
              availabilityError={availabilityError}
              availabilityMessage={availabilityMessage}

              onAddAvailability={addAvailability}
              onUpdateAvailability={updateAvailability}
              onDeleteAvailability={deleteAvailability}

              sessionFee={sessionFee}
              sessionFeeLoading={sessionFeeLoading}
              sessionFeeUpdating={sessionFeeUpdating}
              sessionFeeError={sessionFeeError}
              sessionFeeMessage={sessionFeeMessage}
              onUpdateSessionFee={updateSessionFee}
            />

          ) : role === 'admin' ? (

            <AdminDashboard
              username={username}
              onLogout={handleLogout}
            />

          ) : (

            <Navigate to="/" replace />

          )
        }
      />


      {/* REGISTER PAGE */}

      <Route
        path="/register"
        element={<Register />}
      />


      {/* INVALID ROUTE */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  )
}

export default App
