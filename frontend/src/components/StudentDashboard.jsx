
import React, { useEffect, useState } from 'react';
import './StudentDashboard.css';

import NotificationBell from './NotificationBell';

import {
  MentorSkeleton,
  BookingSkeleton
} from './Skeleton';


function StudentDashboard({

  // USER
  username = 'Student',

  // ACTIVE PAGE
  activeSection = 'overview',

  // PROFILE
  studentProfile = null,
  profileLoading = false,
  profileUpdating = false,
  profileError = '',
  profileMessage = '',
  onUpdateStudentProfile = async () => {},

  // BOOKINGS
  bookings = [],
  bookingLoading = false,

  // MENTORS
  mentors = [],
  mentorLoading = false,
  search = '',
  setSearch = () => {},
  loading = false,

  // NOTIFICATIONS
  notifications = [],
  notificationLoading = false,
  onMarkNotificationRead = () => {},

  // NAVIGATION
  goToSection = () => {},
  onLogout = () => {},

  // BOOKING ACTIONS
  openBooking = () => {},
  closeBooking = () => {},
  submitBooking = () => {},
  selectedMentor = null,

  booking = {
    date: '',
    start_time: '',
    end_time: ''
  },

  handleBookingChange = () => {},
  availableSlots = [],
  slotsLoading = false,
  slotsError = '',
  handleSlotSelect = () => {},

  bookingError = '',
  bookingMessage = '',
  submitting = false,

  today = '',

  formatDate = (date) => date,
  formatTime = (time) => time

}) {

  // =====================================
  // PROFILE FORM STATE
  // =====================================

  const [showProfileModal, setShowProfileModal] = useState(false);

  const [profileForm, setProfileForm] = useState({
    university: '',
    education_level: '',
    bio: ''
  });


  // =====================================
  // LOAD PROFILE DATA
  // =====================================

  useEffect(() => {

    if (studentProfile) {

      setProfileForm({
        university: studentProfile.university || '',
        education_level: studentProfile.education_level || '',
        bio: studentProfile.bio || ''
      });

    }

  }, [studentProfile]);


  // =====================================
  // PROFILE INPUT CHANGE
  // =====================================

  const handleProfileChange = (e) => {

    const { name, value } = e.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value
    }));

  };


  // =====================================
  // SUBMIT PROFILE UPDATE
  // =====================================

  const handleProfileSubmit = async (e) => {

    e.preventDefault();

    try {

      await onUpdateStudentProfile(profileForm);

      setShowProfileModal(false);

    } catch (error) {

      console.error(
        'Student profile update failed:',
        error.response?.data || error.message
      );

    }

  };


  // =====================================
  // PROFILE DATA
  // =====================================

  const profileUsername =
    studentProfile?.username || username;

  const university =
    studentProfile?.university || '';

  const educationLevel =
    studentProfile?.education_level || '';

  const biography =
    studentProfile?.bio || '';


  // =====================================
  // PROFILE PROGRESS
  // =====================================

  const profileChecklist = [

    {
      label: 'Username added',
      completed: Boolean(profileUsername?.trim())
    },

    {
      label: 'University added',
      completed: Boolean(university.trim())
    },

    {
      label: 'Education level added',
      completed: Boolean(educationLevel.trim())
    },

    {
      label: 'Profile biography added',
      completed: Boolean(biography.trim())
    }

  ];

  const completedProfileFields =
    profileChecklist.filter((item) => item.completed).length;

  const profileProgress = Math.round(
    (completedProfileFields / profileChecklist.length) * 100
  );


  // =====================================
  // MENTOR SEARCH
  // =====================================

  const filteredMentors = mentors.filter((mentor) => {

    const mentorName =
      mentor.username ||
      mentor.user?.username ||
      mentor.name ||
      '';

    const expertise = Array.isArray(mentor.expertise)
      ? mentor.expertise.join(' ')
      : mentor.expertise || '';

    const searchText = search.toLowerCase().trim();

    return (
      mentorName.toLowerCase().includes(searchText) ||
      expertise.toLowerCase().includes(searchText)
    );

  });


  // =====================================
  // BOOKING STATISTICS
  // =====================================

  const totalBookings = bookings.length;

  const confirmedBookings = bookings.filter(
    (item) => item.status?.toLowerCase() === 'confirmed'
  ).length;

  const pendingBookings = bookings.filter(
    (item) => item.status?.toLowerCase() === 'pending'
  ).length;

  const completedBookings = bookings.filter(
    (item) => item.status?.toLowerCase() === 'completed'
  ).length;

  const cancelledBookings = bookings.filter(
    (item) => item.status?.toLowerCase() === 'cancelled'
  ).length;


  // =====================================
  // UPCOMING BOOKINGS
  // =====================================

  const localToday = new Date();

  const todayDate = today ||
    `${localToday.getFullYear()}-${String(localToday.getMonth() + 1).padStart(2, '0')}-${String(localToday.getDate()).padStart(2, '0')}`;

  const upcomingBookings = bookings
    .filter((item) => {

      const status = String(item.status || '').toLowerCase();

      return (
        item.date >= todayDate &&
        (status === 'confirmed' || status === 'pending')
      );

    })
    .sort((a, b) => {

      const dateA = `${a.date} ${a.start_time}`;
      const dateB = `${b.date} ${b.start_time}`;

      return dateA.localeCompare(dateB);

    });

  const upcomingCount = upcomingBookings.length;


  // =====================================
  // NOTIFICATION STATISTICS
  // =====================================

  const unreadNotifications = notifications.filter(
    (item) => !item.is_read
  );

  const unreadNotificationCount =
    unreadNotifications.length;


  // =====================================
  // PAGE TITLE
  // =====================================

  const pageTitles = {

    overview: 'Student Dashboard',
    profile: 'My Profile',
    mentors: 'Find Mentors',
    bookings: 'My Bookings',
    notifications: 'Notifications'

  };


  // =====================================
  // RENDER
  // =====================================

  return (

    <div className="student-dashboard">

      {/* =================================
          SIDEBAR
      ================================= */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-logo">
          <h2>MentorMatch</h2>
          <p>Student Portal</p>
        </div>


        <nav className="sidebar-nav">

          <button
            type="button"
            className={activeSection === 'overview' ? 'active' : ''}
            onClick={() => goToSection('overview')}
          >
            <span>📊</span>
            Overview
          </button>


          <button
            type="button"
            className={activeSection === 'profile' ? 'active' : ''}
            onClick={() => goToSection('profile')}
          >
            <span>👤</span>
            My Profile
          </button>


          <button
            type="button"
            className={activeSection === 'mentors' ? 'active' : ''}
            onClick={() => goToSection('mentors')}
          >
            <span>👨‍🏫</span>
            Find Mentors
          </button>


          <button
            type="button"
            className={activeSection === 'bookings' ? 'active' : ''}
            onClick={() => goToSection('bookings')}
          >
            <span>📅</span>
            My Bookings
          </button>


          <button
            type="button"
            className={activeSection === 'notifications' ? 'active' : ''}
            onClick={() => goToSection('notifications')}
          >
            <span>🔔</span>
            Notifications

            {unreadNotificationCount > 0 && (

              <span className="notification-badge">
                {unreadNotificationCount}
              </span>

            )}

          </button>

        </nav>


        {/* LOGOUT */}

        <div className="sidebar-bottom">

          <button
            type="button"
            onClick={onLogout}
          >
            🚪 Logout
          </button>

        </div>

      </aside>


      {/* =================================
          MAIN CONTENT
      ================================= */}

      <main className="dashboard-main">


        {/* =================================
            HEADER
        ================================= */}

        <header className="dashboard-header">

          <div>

            <h1>
              {pageTitles[activeSection] || 'Student Dashboard'}
            </h1>

            <p>
              Welcome back, {username}!
            </p>

          </div>


          <div className="header-user">

            <NotificationBell
              notifications={notifications}
              notificationLoading={notificationLoading}
              onMarkNotificationRead={onMarkNotificationRead}
            />

            <div className="user-avatar">
              {username?.charAt(0).toUpperCase() || 'S'}
            </div>

            <div>
              <strong>{username}</strong>
              <span>Student</span>
            </div>

          </div>

        </header>


        {/* =================================
            1. DASHBOARD OVERVIEW
        ================================= */}

        {activeSection === 'overview' && (

          <section
            id="overview"
            className="dashboard-overview"
          >

            <div className="section-heading">

              <div>
                <h2>Dashboard Overview</h2>
                <p>Track your mentorship activities.</p>
              </div>

            </div>


            {/* STATISTICS */}

            <div className="statistics-grid">


              <div className="stat-card">

                <div className="stat-icon blue">📚</div>

                <div>
                  <p>Total Bookings</p>
                  <h3>{totalBookings}</h3>
                  <span>All booking requests</span>
                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon green">✅</div>

                <div>
                  <p>Completed Sessions</p>
                  <h3>{completedBookings}</h3>
                  <span>Successfully completed</span>
                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon purple">📅</div>

                <div>
                  <p>Upcoming Sessions</p>
                  <h3>{upcomingCount}</h3>
                  <span>Future scheduled sessions</span>
                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon orange">⏳</div>

                <div>
                  <p>Pending Bookings</p>
                  <h3>{pendingBookings}</h3>
                  <span>Waiting for confirmation</span>
                </div>

              </div>

            </div>


            {/* DASHBOARD TOOLS */}

            <div className="dashboard-tools-grid">


              {/* QUICK ACTIONS */}

              <div className="quick-actions-card">

                <div className="section-heading">

                  <div>
                    <h2>Quick Actions</h2>
                    <p>Access your important activities.</p>
                  </div>

                </div>


                <div className="quick-actions-grid">


                  <button
                    type="button"
                    className="quick-action-item"
                    onClick={() => goToSection('mentors')}
                  >

                    <div className="quick-action-icon blue">
                      🔍
                    </div>

                    <div className="quick-action-info">
                      <strong>Find Mentor</strong>
                      <span>Explore expert mentors</span>
                    </div>

                    <span className="action-arrow">
                      Explore →
                    </span>

                  </button>


                  <button
                    type="button"
                    className="quick-action-item"
                    onClick={() => goToSection('bookings')}
                  >

                    <div className="quick-action-icon purple">
                      📅
                    </div>

                    <div className="quick-action-info">
                      <strong>My Bookings</strong>
                      <span>Manage your sessions</span>
                    </div>

                    <span className="action-arrow">
                      View All →
                    </span>

                  </button>


                  <button
                    type="button"
                    className="quick-action-item"
                    onClick={() => goToSection('notifications')}
                  >

                    <div className="quick-action-icon orange">
                      🔔
                    </div>

                    <div className="quick-action-info">
                      <strong>Notifications</strong>
                      <span>Check booking updates</span>
                    </div>

                    <span className="action-arrow">
                      Check Now →
                    </span>

                  </button>


                  <button
                    type="button"
                    className="quick-action-item"
                    onClick={() => setShowProfileModal(true)}
                  >

                    <div className="quick-action-icon blue">
                      👤
                    </div>

                    <div className="quick-action-info">
                      <strong>Edit Profile</strong>
                      <span>Update your information</span>
                    </div>

                    <span className="action-arrow">
                      Edit →
                    </span>

                  </button>

                </div>

              </div>


              {/* PROFILE PROGRESS */}

              <div className="profile-progress-card">

                <div className="section-heading">

                  <div>
                    <h2>Your Profile Progress</h2>
                    <p>Complete your account information.</p>
                  </div>

                </div>


                {profileLoading ? (

                  <p>Loading profile...</p>

                ) : (

                  <>

                    <div className="profile-progress-content">

                      <div
                        className="progress-ring"
                        style={{
                          '--progress': `${profileProgress * 3.6}deg`
                        }}
                      >

                        <div className="progress-ring-inner">
                          <strong>{profileProgress}%</strong>
                          <span>Complete</span>
                        </div>

                      </div>


                      <div className="profile-checklist">

                        {profileChecklist.map((item) => (

                          <div
                            className="checklist-item"
                            key={item.label}
                          >

                            <span
                              className={
                                item.completed
                                  ? 'check-icon'
                                  : 'check-icon incomplete'
                              }
                            >
                              {item.completed ? '✓' : '○'}
                            </span>

                            <span>{item.label}</span>

                          </div>

                        ))}

                      </div>

                    </div>


                    <p className="profile-progress-note">

                      {profileProgress === 100
                        ? 'Congratulations! Your profile is complete.'
                        : 'Complete your profile details to improve your mentorship experience.'}

                    </p>


                    <button
                      type="button"
                      className="edit-profile-btn"
                      onClick={() => setShowProfileModal(true)}
                    >
                      ✏️ Edit Profile
                    </button>

                  </>

                )}

              </div>

            </div>

          </section>

        )}


        {/* =================================
            2. STUDENT PROFILE
        ================================= */}

        {activeSection === 'profile' && (

          <section
            id="profile"
            className="student-profile-section"
          >

            <div className="section-heading">

              <div>
                <h2>My Profile</h2>
                <p>Your personal and educational information.</p>
              </div>

            </div>


            {profileLoading ? (

              <div className="profile-information-card">
                Loading student profile...
              </div>

            ) : (

              <div className="profile-information-card">


                <div className="profile-information-header">

                  <div className="profile-large-avatar">
                    {profileUsername?.charAt(0).toUpperCase() || 'S'}
                  </div>

                  <div>
                    <h3>{profileUsername}</h3>
                    <span>Student Account</span>
                  </div>

                </div>


                <div className="profile-information-grid">


                  <div className="profile-info-item">
                    <span>Username</span>
                    <strong>{profileUsername || 'Not available'}</strong>
                  </div>


                  <div className="profile-info-item">
                    <span>University</span>
                    <strong>{university || 'Not added yet'}</strong>
                  </div>


                  <div className="profile-info-item">
                    <span>Education Level</span>
                    <strong>{educationLevel || 'Not added yet'}</strong>
                  </div>


                  <div className="profile-info-item profile-bio-item">
                    <span>Biography</span>
                    <p>{biography || 'No biography added yet.'}</p>
                  </div>

                </div>


                <button
                  type="button"
                  className="edit-profile-btn"
                  onClick={() => setShowProfileModal(true)}
                >
                  ✏️ Edit My Profile
                </button>

              </div>

            )}

          </section>

        )}


        {/* =================================
            3. FIND MENTORS
        ================================= */}

        {activeSection === 'mentors' && (

          <section
            id="mentors"
            className="mentors-section"
          >

            <div className="section-heading">

              <div>
                <h2>Find Your Mentor</h2>
                <p>Discover experienced mentors and book your session.</p>
              </div>

              <span className="mentor-count">

                {mentorLoading
                  ? 'Loading...'
                  : `${filteredMentors.length} Mentors Available`}

              </span>

            </div>


            {/* SEARCH */}

            <div className="mentor-search">

              <span>🔍</span>

              <input
                type="text"
                placeholder="Search by mentor name, expertise..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>


            {/* MENTOR LOADING */}

            {loading || mentorLoading ? (

              <div className="mentors-grid">

                {[1, 2].map((item) => (
                  <MentorSkeleton key={item} />
                ))}

              </div>

            ) : filteredMentors.length === 0 ? (

              <div className="empty-message">

                <span>👨‍🏫</span>
                <h3>No Mentors Found</h3>

                <p>
                  {search
                    ? 'Try searching with another name or expertise.'
                    : 'No mentors are currently available.'}
                </p>

              </div>

            ) : (

              <div className="mentors-grid">

                {filteredMentors.map((mentor) => {

                  const mentorName =
                    mentor.username ||
                    mentor.user?.username ||
                    mentor.name ||
                    'Mentor';

                  const expertise = Array.isArray(mentor.expertise)
                    ? mentor.expertise.join(', ')
                    : mentor.expertise || 'Not specified';


                  return (

                    <div
                      className="mentor-card"
                      key={mentor.id}
                    >

                      <div className="mentor-avatar">
                        {mentorName.charAt(0).toUpperCase()}
                      </div>

                      <h3>{mentorName}</h3>

                      <span className="mentor-role">
                        Technology Mentor
                      </span>


                      <div className="mentor-expertise">
                        <strong>Expertise</strong>
                        <p>{expertise}</p>
                      </div>


                      <div className="mentor-bio">
                        <strong>About Mentor</strong>
                        <p>
                          {mentor.bio || 'No biography available.'}
                        </p>
                      </div>


                      <button
                        type="button"
                        className="book-session-btn"
                        onClick={() => openBooking(mentor)}
                      >
                        Book a Session →
                      </button>

                    </div>

                  );

                })}

              </div>

            )}

          </section>

        )}


        {/* =================================
            4. MY BOOKINGS
        ================================= */}

        {activeSection === 'bookings' && (

          <>

            {/* UPCOMING BOOKINGS */}

            <section className="upcoming-section">

              <div className="section-heading">

                <div>
                  <h2>Upcoming Bookings</h2>
                  <p>Your scheduled mentorship sessions.</p>
                </div>

                <span className="booking-count">
                  {upcomingCount} Upcoming Sessions
                </span>

              </div>


              {bookingLoading ? (

                <div className="upcoming-grid">

                  {[1, 2].map((item) => (
                    <BookingSkeleton key={item} />
                  ))}

                </div>

              ) : upcomingBookings.length === 0 ? (

                <div className="empty-message">

                  <span>📅</span>
                  <h3>No Upcoming Sessions</h3>

                  <p>
                    You don't have any future mentorship sessions.
                  </p>

                  <button
                    type="button"
                    className="book-session-btn"
                    onClick={() => goToSection('mentors')}
                  >
                    Find a Mentor
                  </button>

                </div>

              ) : (

                <div className="upcoming-grid">

                  {upcomingBookings.map((item) => {

                    const mentorName =
                      item.mentor_username ||
                      item.mentor_name ||
                      `Mentor #${item.mentor}`;

                    const status = String(
                      item.status || ''
                    ).toLowerCase();


                    return (

                      <div
                        className="upcoming-booking-card"
                        key={item.id}
                      >

                        <div className="upcoming-card-header">

                          <div className="upcoming-mentor-info">

                            <div className="upcoming-mentor-avatar">
                              {mentorName.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <h3>{mentorName}</h3>
                              <span>Technology Mentor</span>
                            </div>

                          </div>


                          <span className={`booking-status ${status}`}>
                            {item.status}
                          </span>

                        </div>


                        <div className="upcoming-card-details">

                          <div className="upcoming-detail-item">

                            <span>📅</span>

                            <div>
                              <small>Session Date</small>
                              <strong>{formatDate(item.date)}</strong>
                            </div>

                          </div>


                          <div className="upcoming-detail-item">

                            <span>🕒</span>

                            <div>
                              <small>Session Time</small>

                              <strong>
                                {formatTime(item.start_time)} - {formatTime(item.end_time)}
                              </strong>

                            </div>

                          </div>

                        </div>


                        <div className="upcoming-card-footer">

                          <span className="booking-id">
                            Booking #{item.id}
                          </span>


                          {status === 'confirmed' && item.meeting_link ? (

                            <a
                              href={item.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="upcoming-join-btn"
                            >
                              Join Session →
                            </a>

                          ) : status === 'pending' ? (

                            <span className="waiting-text">
                              Waiting for approval
                            </span>

                          ) : (

                            <span className="waiting-text">
                              Meeting link unavailable
                            </span>

                          )}

                        </div>

                      </div>

                    );

                  })}

                </div>

              )}

            </section>


            {/* ALL BOOKINGS */}

            <section
              id="bookings"
              className="bookings-section"
            >

              <div className="section-heading">

                <div>
                  <h2>My Bookings</h2>
                  <p>Manage and track your mentorship sessions.</p>
                </div>

                <span className="booking-count">
                  {bookings.length} Total Sessions
                </span>

              </div>


              {bookingLoading ? (

                <div className="bookings-list">

                  {[1, 2, 3].map((item) => (
                    <BookingSkeleton key={item} />
                  ))}

                </div>

              ) : bookings.length === 0 ? (

                <div className="empty-message">

                  <span>📅</span>
                  <h3>No bookings yet</h3>
                  <p>Find a mentor and book your first session.</p>

                  <button
                    type="button"
                    onClick={() => goToSection('mentors')}
                    className="book-session-btn"
                  >
                    Find a Mentor
                  </button>

                </div>

              ) : (

                <div className="bookings-list">

                  {bookings.map((item) => (

                    <div
                      className="booking-card"
                      key={item.id}
                    >

                      <div className="booking-main-info">

                        <div className="booking-avatar">
                          👨‍🏫
                        </div>

                        <div>

                          <h3>
                            {item.mentor_username ||
                              item.mentor_name ||
                              `Mentor #${item.mentor}`}
                          </h3>

                          <span>
                            Booking ID: #{item.id}
                          </span>

                        </div>

                      </div>


                      <div className="booking-datetime">

                        <div>
                          <span>📅 Date</span>
                          <strong>{formatDate(item.date)}</strong>
                        </div>

                        <div>
                          <span>🕒 Time</span>

                          <strong>
                            {formatTime(item.start_time)} - {formatTime(item.end_time)}
                          </strong>

                        </div>

                      </div>


                      <div className="booking-status-area">

                        <span
                          className={`booking-status ${String(item.status || '').toLowerCase()}`}
                        >
                          {item.status || 'Unknown'}
                        </span>


                        {item.meeting_link && (

                          <a
                            href={item.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="meeting-link"
                          >
                            Join Meeting →
                          </a>

                        )}

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </section>

          </>

        )}


        {/* =================================
            5. NOTIFICATIONS
        ================================= */}

        {activeSection === 'notifications' && (

          <section
            id="notifications"
            className="notifications-section"
          >

            <div className="section-heading">

              <div>
                <h2>Notifications</h2>
                <p>Stay updated with your booking activities.</p>
              </div>

              <span className="notification-count">
                {unreadNotificationCount} Unread
              </span>

            </div>


            {notificationLoading ? (

              <div className="loading-message">
                Loading notifications...
              </div>

            ) : notifications.length === 0 ? (

              <div className="empty-message">

                <span>🔔</span>
                <h3>No Notifications</h3>
                <p>You are all caught up!</p>

              </div>

            ) : (

              <div className="notifications-list">

                {notifications.map((item) => {

                  const isRead = Boolean(item.is_read);


                  return (

                    <div
                      className={`notification-card ${
                        isRead ? 'is-read' : 'is-unread'
                      }`}
                      key={item.id}
                    >

                      <div className="notification-icon">
                        🔔
                      </div>


                      <div className="notification-content">

                        <h3>
                          {item.title || 'Notification'}
                        </h3>

                        <p>
                          {item.message || ''}
                        </p>


                        <span>

                          {item.date
                            ? formatDate(item.date)
                            : item.created_at
                              ? new Date(item.created_at).toLocaleDateString()
                              : ''}

                          {item.time
                            ? ` | ${formatTime(item.time)}`
                            : item.created_at
                              ? ` | ${new Date(item.created_at).toLocaleTimeString()}`
                              : ''}

                        </span>


                        {!isRead && (

                          <button
                            type="button"
                            className="mark-all-read"
                            onClick={() => onMarkNotificationRead(item.id)}
                          >
                            Mark as read
                          </button>

                        )}

                      </div>


                      <span
                        className={
                          isRead ? 'read-label' : 'pending-label'
                        }
                      >
                        {isRead ? 'Read' : 'Unread'}
                      </span>

                    </div>

                  );

                })}

              </div>

            )}

          </section>

        )}


        {/* =================================
            EDIT STUDENT PROFILE MODAL
        ================================= */}

        {showProfileModal && (

          <div className="modal-overlay">

            <div className="booking-modal profile-edit-modal">

              <div className="modal-header">

                <div>
                  <h2>Edit Student Profile</h2>
                  <p>Update your educational information.</p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setShowProfileModal(false)}
                  disabled={profileUpdating}
                >
                  ×
                </button>

              </div>


              {profileError && (

                <div className="booking-error">
                  {profileError}
                </div>

              )}


              <form onSubmit={handleProfileSubmit}>


                <div className="form-group">

                  <label htmlFor="profile-username">
                    Username
                  </label>

                  <input
                    id="profile-username"
                    type="text"
                    value={profileUsername}
                    disabled
                  />

                </div>


                <div className="form-group">

                  <label htmlFor="university">
                    University
                  </label>

                  <input
                    id="university"
                    type="text"
                    name="university"
                    placeholder="Enter your university"
                    value={profileForm.university}
                    onChange={handleProfileChange}
                  />

                </div>


                <div className="form-group">

                  <label htmlFor="education_level">
                    Education Level
                  </label>

                  <input
                    id="education_level"
                    type="text"
                    name="education_level"
                    placeholder="Example: BSc in CSE"
                    value={profileForm.education_level}
                    onChange={handleProfileChange}
                  />

                </div>


                <div className="form-group">

                  <label htmlFor="bio">
                    Biography
                  </label>

                  <textarea
                    id="bio"
                    name="bio"
                    rows="4"
                    placeholder="Tell us about yourself..."
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                  />

                </div>


                {profileMessage && (

                  <div className="booking-success">
                    {profileMessage}
                  </div>

                )}


                <div className="modal-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowProfileModal(false)}
                    disabled={profileUpdating}
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="book-session-btn"
                    disabled={profileUpdating || profileLoading}
                  >
                    {profileUpdating
                      ? 'Saving...'
                      : 'Save Changes'}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}


      </main>

    </div>

  );

}

export default StudentDashboard;
