
import React from 'react';
import './BookingPage.css';

function formatTime(time) {
  if (!time) return '';

  const [hourString, minute] = time.split(':');
  const hour = Number(hourString);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
}

function formatDate(date) {
  if (!date) return 'Not selected';

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }
  );
}

function BookingPage({
  selectedMentor,
  booking,
  handleBookingChange,
  availableSlots = [],
  slotsLoading = false,
  slotsError = '',
  handleSlotSelect,
  bookingError = '',
  bookingMessage = '',
  submitting = false,
  today,
  onSubmit,
  onCancel
}) {
  const mentorName =
    selectedMentor?.username ||
    selectedMentor?.user?.username ||
    selectedMentor?.name ||
    'Mentor';

  const mentorInitial = mentorName.charAt(0).toUpperCase();

  const hasSelectedSlot =
    Boolean(booking?.start_time && booking?.end_time);

  return (
    <div className="booking-page">

      {/* Header */}
      <header className="booking-page-header">
        <div className="booking-header-brand">
          <div className="booking-brand-icon">M</div>

          <div>
            <div className="booking-brand">MentorMatch</div>
            <p>Student Portal</p>
          </div>
        </div>

        <button
          type="button"
          className="booking-back-btn"
          onClick={onCancel}
          disabled={submitting}
        >
          <span>←</span> Back to Dashboard
        </button>
      </header>

      {/* Main Content */}
      <main className="booking-page-content">

        <div className="booking-page-heading">
          <div className="booking-eyebrow">
            <span className="booking-eyebrow-dot"></span>
            MENTORSHIP SESSION
          </div>

          <h1>Book Your Session</h1>

          <p>
            Schedule a one-to-one mentorship session
            and take the next step in your career.
          </p>
        </div>

        <div className="booking-layout">

          {/* Booking Form */}
          <section className="booking-page-card">

            <div className="booking-card-heading">
              <div>
                <h2>Session Details</h2>
                <p>Choose your preferred date and time.</p>
              </div>

              <span className="booking-step-badge">
                STEP 01
              </span>
            </div>

            {/* Mentor Information */}
            <div className="booking-mentor-summary">

              <div className="booking-mentor-avatar">
                {mentorInitial}
              </div>

              <div className="booking-mentor-info">
                <span className="booking-small-label">
                  BOOKING WITH
                </span>

                <h3>{mentorName}</h3>

                <p>
                  <span className="booking-online-dot"></span>
                  Technology Mentor
                </p>
              </div>

              <div className="booking-mentor-tag">
                Mentor
              </div>
            </div>

            <form onSubmit={onSubmit}>

              {/* Date Selection */}
              <div className="booking-form-section">

                <label htmlFor="booking-page-date">
                  <span className="booking-label-icon">01</span>
                  Choose Session Date
                </label>

                <input
                  id="booking-page-date"
                  type="date"
                  name="date"
                  min={today}
                  value={booking?.date || ''}
                  onChange={handleBookingChange}
                  required
                  disabled={submitting}
                />

                <small>
                  Select a date to view the mentor's available time slots.
                </small>

              </div>

              {/* Available Slots */}
              <div className="booking-slots-section">

                <div className="booking-slots-heading">

                  <div>
                    <label>
                      <span className="booking-label-icon">02</span>
                      Available Time Slots
                    </label>

                    <p>
                      {booking?.date
                        ? 'Select one available session.'
                        : 'Choose a date to see available sessions.'}
                    </p>
                  </div>

                  {booking?.date && (
                    <span className="booking-slot-count">
                      {availableSlots.length} Available
                    </span>
                  )}

                </div>

                {slotsLoading && (
                  <div className="booking-info-message">
                    <span className="booking-spinner"></span>
                    Loading available time slots...
                  </div>
                )}

                {slotsError && (
                  <div className="booking-page-error" role="alert">
                    {slotsError}
                  </div>
                )}

                {!slotsLoading &&
                  !slotsError &&
                  booking?.date &&
                  availableSlots.length === 0 && (
                    <div className="booking-info-message">
                      <span className="booking-info-icon">!</span>
                      No available slots for this date.
                      Please choose another date.
                    </div>
                  )}

                {!booking?.date && (
                  <div className="booking-info-message">
                    <span className="booking-calendar-icon">▦</span>
                    Your mentor's available time slots will appear here.
                  </div>
                )}

                {!slotsLoading &&
                  availableSlots.length > 0 && (
                    <div className="booking-slot-grid">

                      {availableSlots.map((slot, index) => {

                        const isSelected =
                          booking?.start_time === slot.start_time &&
                          booking?.end_time === slot.end_time;

                        return (
                          <button
                            key={slot.id ?? `${slot.start_time}-${index}`}
                            type="button"
                            className={`booking-slot-button ${
                              isSelected ? 'selected' : ''
                            }`}
                            onClick={() => handleSlotSelect(slot)}
                            disabled={submitting}
                          >
                            <span className="booking-slot-time">
                              {formatTime(slot.start_time)}
                              <span> – </span>
                              {formatTime(slot.end_time)}
                            </span>

                            {isSelected && (
                              <span className="booking-selected-check">
                                ✓
                              </span>
                            )}

                          </button>
                        );
                      })}

                    </div>
                  )}

              </div>

              {/* Selected Booking Summary */}
              <div className="booking-summary">

                <div className="booking-summary-heading">
                  <span>Booking Summary</span>
                  <span className="booking-summary-status">
                    {hasSelectedSlot ? 'Ready' : 'Pending'}
                  </span>
                </div>

                <div className="booking-summary-row">
                  <span>Mentor</span>
                  <strong>{mentorName}</strong>
                </div>

                <div className="booking-summary-row">
                  <span>Date</span>
                  <strong>
                    {formatDate(booking?.date)}
                  </strong>
                </div>

                <div className="booking-summary-row">
                  <span>Time</span>
                  <strong>
                    {hasSelectedSlot
                      ? `${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`
                      : 'Not selected'}
                  </strong>
                </div>

              </div>

              {/* Error */}
              {bookingError && (
                <div className="booking-page-error" role="alert">
                  <strong>Booking Error</strong>
                  <p>{bookingError}</p>
                </div>
              )}

              {/* Success */}
              {bookingMessage && (
                <div className="booking-page-success" role="status">
                  <strong>Booking Successful!</strong>
                  <p>{bookingMessage}</p>
                </div>
              )}

              {/* Actions */}
              <div className="booking-page-actions">

                <button
                  type="button"
                  className="booking-cancel-button"
                  onClick={onCancel}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="booking-submit-button"
                  disabled={
                    submitting ||
                    slotsLoading ||
                    !booking?.date ||
                    !booking?.start_time ||
                    !booking?.end_time
                  }
                >
                  {submitting ? (
                    <>
                      <span className="booking-button-spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <span>→</span>
                    </>
                  )}
                </button>

              </div>

            </form>

          </section>

          {/* Information Panel */}
          <aside className="booking-side-panel">

            <div className="booking-side-icon">✦</div>

            <h3>Your next step starts here.</h3>

            <p>
              Connect with experienced mentors, improve your
              technical skills and prepare for your next career move.
            </p>

            <div className="booking-benefit-list">

              <div>
                <span>✓</span>
                One-to-one mentorship
              </div>

              <div>
                <span>✓</span>
                Personalized guidance
              </div>

              <div>
                <span>✓</span>
                Mock interview practice
              </div>

              <div>
                <span>✓</span>
                Session feedback
              </div>

            </div>

            <div className="booking-side-note">
              <strong>Booking Policy</strong>
              <p>
                Your booking request will be sent to the mentor
                for approval. You will be able to see its status
                in your dashboard.
              </p>
            </div>

          </aside>

        </div>

        <footer className="booking-page-footer">
          © 2026 MentorMatch. All rights reserved.
        </footer>

      </main>
    </div>
  );
}

export default BookingPage;
