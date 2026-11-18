import { useState } from 'react'
import './NotificationBell.css'

function NotificationBell({
  notifications = [],
  notificationLoading = false,
  onMarkNotificationRead = () => {}
}) {

  const [isOpen, setIsOpen] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const [markingIds, setMarkingIds] = useState([])

  // =================================
  // UNREAD NOTIFICATIONS
  // =================================

  const unreadNotifications = notifications.filter(
    item => !item.is_read
  )

  const unreadCount = unreadNotifications.length

  // =================================
  // FORMAT DATE AND TIME
  // =================================

  const formatDateTime = item => {

    if (item.created_at) {

      const date = new Date(item.created_at)

      if (!Number.isNaN(date.getTime())) {

        return date.toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    }

    return item.date || ''
  }

  // =================================
  // MARK SINGLE NOTIFICATION AS READ
  // =================================

  const markAsRead = async id => {

    if (
      markingAll ||
      markingIds.includes(id)
    ) {
      return
    }

    setMarkingIds(previous => [...previous, id])

    try {

      await onMarkNotificationRead(id)

    } catch (error) {

      console.error(
        'Failed to mark notification as read:',
        error
      )

    } finally {

      setMarkingIds(previous =>
        previous.filter(itemId => itemId !== id)
      )

    }
  }

  // =================================
  // MARK ALL NOTIFICATIONS AS READ
  // =================================

  const markAllAsRead = async () => {

    if (markingAll || unreadCount === 0) return

    const unreadIds = unreadNotifications.map(
      item => item.id
    )

    setMarkingAll(true)
    setMarkingIds(unreadIds)

    try {

      const results = await Promise.allSettled(
        unreadIds.map(id =>
          onMarkNotificationRead(id)
        )
      )

      const failedCount = results.filter(
        result => result.status === 'rejected'
      ).length

      if (failedCount > 0) {
        console.error(
          `${failedCount} notifications could not be marked as read.`
        )
      }

    } finally {

      setMarkingAll(false)
      setMarkingIds([])

    }
  }

  // =================================
  // CLOSE DROPDOWN
  // =================================

  const closeDropdown = () => {
    setIsOpen(false)
  }

  // =================================
  // UI
  // =================================

  return (

    <div className="notification-wrapper">

      {/* NOTIFICATION BELL */}

      <button
        type="button"
        className="notification-bell-btn"
        onClick={() => {
          console.log('Bell clicked!')
          setIsOpen(previous => {
            console.log('Dropdown state:', !previous)
            return !previous
          })
        }}
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >

        <svg
          viewBox="0 0 24 24"
          width="23"
          height="23"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>

        {unreadCount > 0 && (

          <span className="notification-unread-count">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>

        )}

      </button>

      {/* NOTIFICATION DROPDOWN */}

      {isOpen && (

        <div className="notification-dropdown">

          {/* HEADER */}

          <div className="notification-dropdown-header">

            <div>
              <h3>Notifications</h3>

              <p>
                {unreadCount} unread notifications
              </p>
            </div>

            {unreadCount > 0 && (

              <button
                type="button"
                onClick={markAllAsRead}
                className="mark-all-read"
                disabled={markingAll}
              >
                {markingAll
                  ? 'Marking...'
                  : 'Mark all as read'}
              </button>

            )}

          </div>

          {/* NOTIFICATION LIST */}

          <div className="notification-dropdown-list">

            {notificationLoading ? (

              <div className="notification-empty">
                <p>Loading notifications...</p>
              </div>

            ) : notifications.length === 0 ? (

              <div className="notification-empty">

                <span>🔔</span>

                <h4>No notifications</h4>

                <p>You are all caught up!</p>

              </div>

            ) : (

              notifications.map(item => {

                const isRead = Boolean(item.is_read)

                const isMarking =
                  markingIds.includes(item.id)

                return (

                  <div
                    key={item.id}
                    className={`notification-dropdown-item ${
                      isRead ? 'is-read' : 'is-unread'
                    }`}
                  >

                    {/* ICON */}

                    <div className="notification-item-icon">
                      🔔
                    </div>

                    {/* CONTENT */}

                    <div className="notification-item-content">

                      <h4>
                        {item.title || 'Notification'}
                      </h4>

                      <p>
                        {item.message || ''}
                      </p>

                      <span>
                        {formatDateTime(item)}
                      </span>

                      {!isRead && (

                        <button
                          type="button"
                          className="mark-all-read"
                          disabled={isMarking || markingAll}
                          onClick={() => markAsRead(item.id)}
                        >
                          {isMarking
                            ? 'Marking...'
                            : 'Mark as read'}
                        </button>

                      )}

                      {isRead && (

                        <span className="notification-read-label">
                          ✓ Read
                        </span>

                      )}

                    </div>

                    {/* UNREAD INDICATOR */}

                    {!isRead && (

                      <span
                        className="notification-unread-dot"
                        aria-label="Unread"
                      />

                    )}

                  </div>

                )
              })

            )}

          </div>

          {/* FOOTER */}

          <div className="notification-dropdown-footer">

            <span>MentorMatch Notifications</span>

            <button
              type="button"
              onClick={closeDropdown}
              className="notification-close-btn"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>

  )
}

export default NotificationBell;