
import React, { useState } from 'react'
import './PaymentPage.css'

function PaymentPage({ booking, onBack, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('bkash')
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const [paymentDone, setPaymentDone] = useState(false)

  const API_URL = 'http://127.0.0.1:8000/api/payments/'

  if (!booking) {
    return (
      <div className="payment-page">
        <h2>No booking selected</h2>
        <button onClick={onBack}>Back to Dashboard</button>
      </div>
    )
  }

  const mentorName =
    booking.mentor_username ||
    booking.mentor_name ||
    `Mentor #${booking.mentor}`

  const handleDemoPayment = async () => {
    if (processing || paymentDone) return

    setProcessing(true)
    setMessage('')

    try {
      const token = localStorage.getItem('access')

      if (!token) {
        throw new Error('Please login again. Access token not found.')
      }

      // Step 1: Create Payment
      const createResponse = await fetch(`${API_URL}create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          booking: booking.id
        })
      })

      const createData = await createResponse.json()

      if (!createResponse.ok) {
        throw new Error(
          createData.error ||
          createData.detail ||
          'Payment initialization failed.'
        )
      }

      const paymentId = createData.payment?.id

      if (!paymentId) {
        throw new Error('Payment ID was not returned by the server.')
      }

      // Step 2: Confirm Demo Payment
      const confirmResponse = await fetch(
        `${API_URL}confirm/${paymentId}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            action: 'success'
          })
        }
      )

      const confirmData = await confirmResponse.json()

      if (!confirmResponse.ok) {
        throw new Error(
          confirmData.error ||
          confirmData.detail ||
          'Payment confirmation failed.'
        )
      }

      // Step 3: Update Frontend
      setPaymentDone(true)
      setMessage('Demo payment successful! Booking confirmed.')

      onPaymentSuccess?.({
        booking_id: booking.id,
        payment_id: paymentId,
        amount: confirmData.payment?.amount,
        payment_method: paymentMethod,
        status: 'success',
        booking_status: confirmData.booking_status,
        transaction_id: confirmData.payment?.transaction_id
      })

    } catch (error) {
      console.error('Payment Error:', error)
      setMessage(error.message || 'Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="payment-page">
      <div className="payment-container">

        <button className="payment-back" onClick={onBack}>
          ← Back
        </button>

        <h1>Complete Your Payment</h1>
        <p>Secure your mentorship session.</p>

        <div className="payment-summary">
          <h2>Booking Summary</h2>

          <p>Booking ID: #{booking.id}</p>
          <p>Mentor: {mentorName}</p>
          <p>Date: {booking.date}</p>
          <p>
            Time: {booking.start_time} - {booking.end_time}
          </p>

          <h2>
            Amount: BDT {Number(booking.session_fee || 850).toFixed(2)}
          </h2>
        </div>

        <div className="payment-methods">
          <h2>Select Payment Method</h2>

          <label>
            <input
              type="radio"
              value="bkash"
              checked={paymentMethod === 'bkash'}
              onChange={e => setPaymentMethod(e.target.value)}
              disabled={processing || paymentDone}
            />
            bKash Demo
          </label>

          <label>
            <input
              type="radio"
              value="nagad"
              checked={paymentMethod === 'nagad'}
              onChange={e => setPaymentMethod(e.target.value)}
              disabled={processing || paymentDone}
            />
            Nagad Demo
          </label>
        </div>

        <button
          className="demo-pay-button"
          onClick={handleDemoPayment}
          disabled={processing || paymentDone}
        >
          {processing
            ? 'Processing...'
            : paymentDone
              ? 'Payment Completed'
              : 'Pay Now'}
        </button>

        {message && (
          <p className={paymentDone ? 'payment-success' : 'payment-error'}>
            {message}
          </p>
        )}

        <small>
          Demo payment only. No real money will be charged.
        </small>

      </div>
    </div>
  )
}

export default PaymentPage
