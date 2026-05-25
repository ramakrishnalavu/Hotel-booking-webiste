import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const BookingPage = () => {
  const navigate = useNavigate();
  const { user, bookingState, setBookingState, showToast } = useAuth();

  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [days, setDays] = useState(0);

  // Date span calculations
  useEffect(() => {
    if (bookingState.checkIn && bookingState.checkOut) {
      const start = new Date(bookingState.checkIn);
      const end = new Date(bookingState.checkOut);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDays(diffDays || 1);
    }
  }, [bookingState.checkIn, bookingState.checkOut]);

  // Validate checkouts safety
  if (!bookingState.roomId || !bookingState.hotelId) {
    return (
      <div style={{ padding: '60px' }}>
        <h3>No Room Selected</h3>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Explore Hotels
        </button>
      </div>
    );
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      // Validate coupon code via centralized API
      const response = await api.get(`/api/coupons/validate/${couponCode.trim().toUpperCase()}`);
      const coupon = response.data;
      
      setBookingState((prev) => ({
        ...prev,
        couponCode: coupon.code,
        discountPercent: coupon.discountPercent
      }));

      showToast(`Coupon applied! ${coupon.discountPercent}% discount activated.`, 'success');
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Invalid or expired coupon code.';
      showToast(errMsg, 'error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleClearCoupon = () => {
    setBookingState((prev) => ({
      ...prev,
      couponCode: '',
      discountPercent: 0
    }));
    setCouponCode('');
    showToast('Coupon removed.', 'info');
  };

  // Pricing math variables
  const subtotal = bookingState.pricePerNight * days;
  const discountAmount = subtotal * (bookingState.discountPercent / 100);
  const total = subtotal - discountAmount;

  const handleProceedToPayment = () => {
    // Proceed to Payment Gate
    navigate('/payment');
  };

  return (
    <div className="container" style={{ paddingBottom: '60px', textAlign: 'left' }}>
      <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Confirm Reservation</h2>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left Side: Summary Panel */}
        <div style={{ flexGrow: 1, flexBasis: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
              🏨 Selection Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hotel</span>
                <p style={{ fontSize: '16px', fontWeight: 600 }}>{bookingState.hotelName}</p>
              </div>
              <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Suite Selected</span>
                <p style={{ fontSize: '16px', fontWeight: 600 }}>Room #{bookingState.roomNumber} (${bookingState.pricePerNight} / Night)</p>
              </div>
              
              <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Check In Date</span>
                  <p style={{ fontSize: '15px', fontWeight: 500 }}>{bookingState.checkIn}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Check Out Date</span>
                  <p style={{ fontSize: '15px', fontWeight: 500 }}>{bookingState.checkOut}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Duration</span>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent-blue)' }}>{days} Nights</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Checkout Breakdown & Coupons */}
        <div style={{ width: '380px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Coupon inputs */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
              🎟 Apply Coupon Code
            </h3>
            
            {bookingState.couponCode ? (
              <div 
                className="glass-panel flex-between" 
                style={{ 
                  padding: '12px', 
                  background: 'rgba(16, 185, 129, 0.08)',
                  borderColor: 'rgba(16, 185, 129, 0.25)'
                }}
              >
                <div>
                  <span className="badge badge-available" style={{ fontSize: '10px' }}>Active</span>
                  <p style={{ fontSize: '15px', fontWeight: 600, margin: '2px 0 0 0' }}>{bookingState.couponCode}</p>
                </div>
                <button 
                  onClick={handleClearCoupon}
                  className="btn btn-danger"
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={validatingCoupon}
                  style={{ textTransform: 'uppercase' }}
                />
                <button 
                  type="submit" 
                  className="btn btn-secondary"
                  disabled={validatingCoupon || !couponCode.trim()}
                >
                  {validatingCoupon ? '...' : 'Apply'}
                </button>
              </form>
            )}
          </div>

          {/* Price details breakdowns */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
              💳 Pricing Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14.5px' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Room Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {bookingState.discountPercent > 0 && (
                <div className="flex-between" style={{ color: '#10b981', fontWeight: 500 }}>
                  <span>Coupon Discount ({bookingState.discountPercent}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Security Tax & Fees</span>
                <span style={{ color: '#10b981', fontWeight: 500 }}>FREE</span>
              </div>

              <div 
                className="flex-between" 
                style={{ 
                  borderTop: '1px solid var(--border-glass)', 
                  paddingTop: '14px', 
                  marginTop: '6px',
                  fontSize: '18px',
                  fontWeight: 700
                }}
              >
                <span>Total Due</span>
                <span style={{ color: 'var(--accent-cyan)' }}>${total.toFixed(2)}</span>
              </div>

              <button 
                onClick={handleProceedToPayment}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '16px', fontSize: '15px' }}
              >
                Proceed to Payment Gate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
