
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function BookingSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const booking = location.state?.booking;
  const mentor = location.state?.mentor;

  const mentorName =
    mentor?.username ||
    mentor?.user?.username ||
    mentor?.name ||
    'Your Mentor';

  if (!booking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#f4f7fc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Booking information unavailable</h2>
          <button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f4f7fc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '25px',
      fontFamily: 'Segoe UI, Arial, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '550px',
        background: '#ffffff',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.07)'
      }}>

        <div style={{
          width: '85px',
          height: '85px',
          borderRadius: '50%',
          background: '#dcfce7',
          color: '#16a34a',
          display: 'grid',
          placeItems: 'center',
          fontSize: '45px',
          margin: '0 auto 25px'
        }}>
          ✓
        </div>

        <h1 style={{ color: '#172033' }}>
          Booking Successful!
        </h1>

        <p style={{ color: '#64748b', lineHeight: 1.7 }}>
          Your mentorship session request has been
          submitted successfully.
        </p>

        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '22px',
          margin: '25px 0',
          textAlign: 'left'
        }}>
          <p><strong>Booking ID:</strong> #{booking.id}</p>
          <p><strong>Mentor:</strong> {mentorName}</p>
          <p><strong>Date:</strong> {booking.date}</p>
          <p>
            <strong>Time:</strong>{' '}
            {booking.start_time} - {booking.end_time}
          </p>
          <p>
            <strong>Status:</strong> {booking.status || 'Pending'}
          </p>
        </div>

        <p style={{
          color: '#64748b',
          fontSize: '14px',
          marginBottom: '25px'
        }}>
          Your booking request is waiting for mentor approval.
          Check your dashboard for updates.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            width: '100%',
            padding: '15px',
            background: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Go to Dashboard →
        </button>

      </div>
    </div>
  );
}

export default BookingSuccessPage;
