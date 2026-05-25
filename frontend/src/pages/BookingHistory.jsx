import React, { useState, useEffect } from 'react';
import api from '../services/api';
import BookingCard from '../components/BookingCard';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const BookingHistory = () => {
  const { user, updateLoyaltyPoints, showToast } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // Review modal states
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.get('/api/bookings/history', {
        params: { userId: user.id }
      });
      setBookings(response.data);
    } catch (error) {
      showToast('Error loading booking logs history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    setCancellingId(id);
    try {
      await api.put(`/api/bookings/${id}/cancel`);
      showToast('Booking cancelled and room released successfully!', 'success');
      
      // Fetch updated profile to re-sync loyalty points (deductions)
      const profileResponse = await api.get('/api/auth/me');
      updateLoyaltyPoints(profileResponse.data.loyaltyPoints);

      // Re-load bookings
      fetchBookings();
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to cancel booking.';
      showToast(errMsg, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const openReviewModal = (hotelId) => {
    setSelectedHotelId(hotelId);
    setReviewForm({ rating: 5, comment: '' });
    setIsReviewOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      showToast('Please write a comment for your review!', 'warning');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post(`/api/reviews/hotel/${selectedHotelId}`, {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim()
      });
      
      showToast('Review posted successfully! Aggregate ratings updated.', 'success');
      setIsReviewOpen(false);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to post review.';
      showToast(errMsg, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="container" style={{ paddingBottom: '60px', textAlign: 'left' }}>
      <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>My Reservation Logs</h2>

      {bookings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🧳</span>
          <h3>No Bookings Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginTop: '6px' }}>
            You haven't placed any bookings in the system yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {bookings.map((booking) => (
            <div key={booking.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <BookingCard 
                booking={booking} 
                onCancel={handleCancelBooking} 
              />
              
              {/* Trigger review if booking is confirmed */}
              {booking.bookingStatus === 'CONFIRMED' && (
                <button
                  onClick={() => openReviewModal(booking.hotelId)}
                  className="btn btn-secondary"
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: '-8px',
                    marginLeft: '160px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderRadius: '0 0 var(--border-radius-sm) var(--border-radius-sm)',
                    borderTop: 'none',
                    background: 'rgba(79, 172, 254, 0.08)'
                  }}
                >
                  ✍ Write Hotel Review
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reusable Popup Modal for writing reviews */}
      <Modal 
        isOpen={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)} 
        title="Write Hotel Review"
      >
        <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Star Rating select */}
          <div className="form-group">
            <label className="form-label">Rating Score</label>
            <select
              className="form-input"
              value={reviewForm.rating}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: parseInt(e.target.value) }))}
              style={{ background: 'var(--bg-secondary)', cursor: 'pointer' }}
            >
              <option value="5">★★★★★ (Spectacular)</option>
              <option value="4">★★★★☆ (Very Good)</option>
              <option value="3">★★★☆☆ (Average)</option>
              <option value="2">★★☆☆☆ (Poor)</option>
              <option value="1">★☆☆☆☆ (Terrible)</option>
            </select>
          </div>

          {/* Comment text */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Review Comment</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Describe your room and stay experience..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submittingReview}
            style={{ width: '100%', padding: '12px' }}
          >
            {submittingReview ? 'Posting Review...' : 'Submit Review'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default BookingHistory;
