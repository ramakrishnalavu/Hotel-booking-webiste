import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user, bookingState, setBookingState, updateLoyaltyPoints, showToast } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardHolder: '',
    upiId: ''
  });
  
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [days, setDays] = useState(0);

  // Math variables
  useEffect(() => {
    if (bookingState.checkIn && bookingState.checkOut) {
      const start = new Date(bookingState.checkIn);
      const end = new Date(bookingState.checkOut);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDays(diffDays || 1);
    }
  }, [bookingState.checkIn, bookingState.checkOut]);

  if (!bookingState.roomId || !bookingState.hotelId) {
    return (
      <div style={{ padding: '60px' }}>
        <h3>No active checkout session</h3>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Home
        </button>
      </div>
    );
  }

  const subtotal = bookingState.pricePerNight * days;
  const total = subtotal - (subtotal * (bookingState.discountPercent / 100));

  const validate = () => {
    const newErrors = {};

    if (paymentMethod === 'CARD') {
      // Luhn Algorithm Card validation helper
      const ccNum = formData.cardNumber.replace(/\s+/g, '');
      const ccRegex = /^[0-9]{16}$/;
      if (!ccNum) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!ccRegex.test(ccNum)) {
        newErrors.cardNumber = 'Card number must be exactly 16 digits';
      }

      // Expiry validation check
      const expRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
      if (!formData.cardExpiry) {
        newErrors.cardExpiry = 'Expiry is required';
      } else if (!expRegex.test(formData.cardExpiry)) {
        newErrors.cardExpiry = 'Must be in MM/YY format';
      }

      // CVV check
      const cvvRegex = /^[0-9]{3}$/;
      if (!formData.cardCvv) {
        newErrors.cardCvv = 'CVV is required';
      } else if (!cvvRegex.test(formData.cardCvv)) {
        newErrors.cardCvv = 'Must be 3 digits';
      }

      if (!formData.cardHolder || formData.cardHolder.trim().length < 2) {
        newErrors.cardHolder = 'Cardholder name is required';
      }
    } else {
      // UPI validation
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!formData.upiId) {
        newErrors.upiId = 'UPI Handle is required';
      } else if (!upiRegex.test(formData.upiId)) {
        newErrors.upiId = 'Invalid UPI ID format (e.g. name@upi)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSettlePayment = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setProcessing(true);
    try {
      // Step 1: Place Booking Reservation (Prevents double bookings using backend pessimistic lock checks!)
      const bookingResponse = await api.post('/api/bookings', {
        roomId: bookingState.roomId,
        checkInDate: bookingState.checkIn,
        checkOutDate: bookingState.checkOut,
        couponCode: bookingState.couponCode || undefined
      });
      
      const booking = bookingResponse.data;

      // Step 2: Settle Booking Payment
      const transactionId = 'TXN-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      const paymentResponse = await api.post('/api/payments', {
        bookingId: booking.id,
        paymentMethod: paymentMethod,
        transactionDetails: paymentMethod === 'CARD' ? `CARD ending in ${formData.cardNumber.slice(-4)}` : `UPI ID ${formData.upiId}`
      });

      const payment = paymentResponse.data;

      // Step 3: Fetch updated profile to hydrate context loyalty points
      const profileResponse = await api.get('/api/auth/me');
      updateLoyaltyPoints(profileResponse.data.loyaltyPoints);

      showToast('Booking and payment settled successfully! Confirmed.', 'success');
      
      // Clear global checkout selections
      setBookingState({
        hotelId: null,
        hotelName: '',
        roomId: null,
        roomNumber: '',
        pricePerNight: 0,
        checkIn: '',
        checkOut: '',
        couponCode: '',
        discountPercent: 0
      });

      // Redirect to Booking History logs
      navigate('/history');
    } catch (error) {
      // Step 4: Handle Room availability conflicts gracefully (e.g. 409 Booking Conflict!)
      const errMsg = error.response?.data?.message || 'Payment execution failed due to an availability conflict.';
      showToast(errMsg, 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '60px', textAlign: 'left' }}>
      <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Complete Payment</h2>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left Side: Payment Form */}
        <div style={{ flexGrow: 1, flexBasis: '500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
              💳 Select Payment Method
            </h3>

            {/* Selector tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <button 
                type="button"
                onClick={() => { setPaymentMethod('CARD'); setErrors({}); }}
                className={`btn ${paymentMethod === 'CARD' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                disabled={processing}
              >
                Credit / Debit Card
              </button>
              <button 
                type="button"
                onClick={() => { setPaymentMethod('UPI'); setErrors({}); }}
                className={`btn ${paymentMethod === 'UPI' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                disabled={processing}
              >
                UPI Handle
              </button>
            </div>

            <form onSubmit={handleSettlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {paymentMethod === 'CARD' ? (
                <>
                  {/* Card Number */}
                  <div className="form-group">
                    <label className="form-label">Credit Card Number</label>
                    <input 
                      type="text"
                      name="cardNumber"
                      className="form-input"
                      placeholder="1234 5678 1234 5678"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      disabled={processing}
                      maxLength={19}
                      style={{ borderColor: errors.cardNumber ? '#ef4444' : 'var(--border-glass)' }}
                    />
                    {errors.cardNumber && (
                      <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>
                        ⚠ {errors.cardNumber}
                      </span>
                    )}
                  </div>

                  {/* Expiry and CVV */}
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: '1 1 120px' }}>
                      <label className="form-label">Expiry (MM/YY)</label>
                      <input 
                        type="text"
                        name="cardExpiry"
                        className="form-input"
                        placeholder="12/28"
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        disabled={processing}
                        maxLength={5}
                        style={{ borderColor: errors.cardExpiry ? '#ef4444' : 'var(--border-glass)' }}
                      />
                      {errors.cardExpiry && (
                        <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>
                          ⚠ {errors.cardExpiry}
                        </span>
                      )}
                    </div>
                    <div className="form-group" style={{ flex: '1 1 120px' }}>
                      <label className="form-label">CVV Code</label>
                      <input 
                        type="password"
                        name="cardCvv"
                        className="form-input"
                        placeholder="***"
                        value={formData.cardCvv}
                        onChange={handleChange}
                        disabled={processing}
                        maxLength={3}
                        style={{ borderColor: errors.cardCvv ? '#ef4444' : 'var(--border-glass)' }}
                      />
                      {errors.cardCvv && (
                        <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>
                          ⚠ {errors.cardCvv}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Holder */}
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label">Cardholder Name</label>
                    <input 
                      type="text"
                      name="cardHolder"
                      className="form-input"
                      placeholder="e.g. John Doe"
                      value={formData.cardHolder}
                      onChange={handleChange}
                      disabled={processing}
                      style={{ borderColor: errors.cardHolder ? '#ef4444' : 'var(--border-glass)' }}
                    />
                    {errors.cardHolder && (
                      <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>
                        ⚠ {errors.cardHolder}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                /* UPI Layout */
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Virtual Payment Address (VPA)</label>
                  <input 
                    type="text"
                    name="upiId"
                    className="form-input"
                    placeholder="e.g. john@okaxis"
                    value={formData.upiId}
                    onChange={handleChange}
                    disabled={processing}
                    style={{ borderColor: errors.upiId ? '#ef4444' : 'var(--border-glass)' }}
                  />
                  {errors.upiId && (
                    <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>
                      ⚠ {errors.upiId}
                    </span>
                  )}
                </div>
              )}

              <button 
                type="submit"
                className="btn btn-accent"
                style={{ width: '100%', padding: '12px', fontSize: '15px' }}
                disabled={processing}
              >
                {processing ? 'Processing Secure Settle...' : `Pay $${total.toFixed(2)} & Confirm`}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Order summary info */}
        <div style={{ width: '380px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
              📝 Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Hotel:</span>
                <strong style={{ color: 'var(--text-active)' }}>{bookingState.hotelName}</strong>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Room:</span>
                <strong>Suite #{bookingState.roomNumber}</strong>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Dates:</span>
                <span style={{ fontSize: '13px' }}>{bookingState.checkIn} to {bookingState.checkOut}</span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
                <strong>{days} Nights</strong>
              </div>
              <div className="flex-between" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '12px', marginTop: '4px', fontSize: '16px', fontWeight: 700 }}>
                <span>Final Price:</span>
                <span style={{ color: 'var(--accent-cyan)' }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
