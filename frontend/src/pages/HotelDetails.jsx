import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, bookingState, setBookingState, showToast } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingRooms, setFetchingRooms] = useState(false);

  // Date selection states (prefilled from global Context if exists, otherwise default tomorrow/day-after)
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterStr = dayAfter.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(bookingState.checkIn || tomorrowStr);
  const [checkOut, setCheckOut] = useState(bookingState.checkOut || dayAfterStr);

  const fetchHotelData = async () => {
    setLoading(true);
    try {
      const hotelResponse = await api.get(`/api/hotels/${id}`);
      setHotel(hotelResponse.data);
      
      const reviewsResponse = await api.get(`/api/reviews/hotel/${id}`);
      setReviews(reviewsResponse.data);
    } catch (error) {
      showToast('Error loading hotel profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    if (!checkIn || !checkOut) return;
    
    // Dates Validation
    if (checkIn < todayStr) {
      showToast('Check-in date cannot be in the past!', 'warning');
      return;
    }
    if (checkOut <= checkIn) {
      showToast('Check-out date must be after check-in!', 'warning');
      return;
    }

    setFetchingRooms(true);
    try {
      const response = await api.get(`/api/rooms/hotel/${id}`, {
        params: { checkIn, checkOut }
      });
      setRooms(response.data);
    } catch (error) {
      showToast('Error checking room availability overlaps.', 'error');
    } finally {
      setFetchingRooms(false);
    }
  };

  useEffect(() => {
    fetchHotelData();
  }, [id]);

  useEffect(() => {
    if (hotel) {
      fetchAvailableRooms();
    }
  }, [hotel, checkIn, checkOut]);

  const handleBookRoom = (room) => {
    if (!user) {
      showToast('Authentication is required to place a reservation.', 'info');
      navigate('/login');
      return;
    }

    // Persist selections inside AuthContext global state
    setBookingState((prev) => ({
      ...prev,
      hotelId: hotel.id,
      hotelName: hotel.hotelName,
      roomId: room.id,
      roomNumber: room.roomNumber,
      pricePerNight: room.pricePerNight,
      checkIn: checkIn,
      checkOut: checkOut
    }));

    // Proceed to Checkout
    navigate('/booking');
  };

  if (loading) return <Loader fullScreen />;
  if (!hotel) return <div style={{ padding: '60px' }}>Hotel profile not found.</div>;

  return (
    <div className="container" style={{ paddingBottom: '60px', textAlign: 'left' }}>
      {/* Hotel Showcase Cover */}
      <div 
        className="glass-panel"
        style={{
          padding: '40px',
          backgroundImage: `linear-gradient(rgba(10, 11, 16, 0.7), rgba(10, 11, 16, 0.95)), url("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          marginBottom: '32px'
        }}
      >
        <span className="badge badge-available" style={{ marginBottom: '8px' }}>★ {hotel.rating.toFixed(1)} rating</span>
        <h2 style={{ fontSize: '38px', margin: '0 0 8px 0' }} className="gradient-text">{hotel.hotelName}</h2>
        <p style={{ color: 'var(--text-primary)', fontSize: '15px' }}>📍 {hotel.address}, {hotel.city}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginTop: '12px', maxWidth: '800px' }}>
          {hotel.description}
        </p>
      </div>

      {/* Main split grid */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left Side: Rooms Catalog Selection */}
        <div style={{ flexGrow: 1, flexBasis: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
              🏨 Available Suites
            </h3>

            {/* Dates range checks */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                <label className="form-label">Check In Date</label>
                <input 
                  type="date" 
                  min={todayStr}
                  className="form-input"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                <label className="form-label">Check Out Date</label>
                <input 
                  type="date" 
                  min={checkIn || todayStr}
                  className="form-input"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>

            {fetchingRooms ? (
              <Loader />
            ) : rooms.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🚫</span>
                <h4>No Suites Available</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
                  No rooms are available for the selected dates. Try other date combinations.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {rooms.map((room) => (
                  <div 
                    key={room.id} 
                    className="glass-card" 
                    style={{ 
                      padding: '20px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}
                  >
                    <div>
                      <span className="badge badge-role" style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {room.roomType}
                      </span>
                      <h4 style={{ fontSize: '18px', margin: '4px 0 2px 0' }}>Room #{room.roomNumber}</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Accommodates up to: <strong style={{ color: 'var(--text-active)' }}>{room.maxGuests} guests</strong>
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Price per night</span>
                        <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          ${room.pricePerNight}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleBookRoom(room)}
                        className="btn btn-primary"
                        style={{ padding: '10px 20px' }}
                      >
                        Reserve Suite
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Reviews & Ratings */}
        <div style={{ width: '360px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
              ⭐ Guest Reviews
            </h3>

            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', textAlign: 'center', padding: '20px 0' }}>
                No reviews have been posted for this hotel yet. Be the first to book and share your experience!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto' }}>
                {reviews.map((review) => (
                  <div 
                    key={review.id} 
                    className="glass-panel" 
                    style={{ 
                      padding: '14px', 
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.03)'
                    }}
                  >
                    <div className="flex-between" style={{ marginBottom: '6px' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--text-active)' }}>
                        {review.userFullName}
                      </strong>
                      <span style={{ color: 'var(--accent-gold)', fontSize: '13px', fontWeight: 600 }}>
                        {'★'.repeat(review.rating)}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                      "{review.comment}"
                    </p>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
