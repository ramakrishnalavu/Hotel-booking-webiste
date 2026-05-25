import React from 'react';

const BookingCard = ({ booking, onCancel }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge-available">Confirmed</span>;
      case 'CANCELLED':
        return <span className="badge badge-booked">Cancelled</span>;
      default:
        return <span className="badge badge-maintenance">Pending</span>;
    }
  };

  const getHotelImagePlaceholder = (hotelId) => {
    const images = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80'
    ];
    return images[(hotelId - 1) % images.length] || images[0];
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', gap: '20px', padding: '20px', textAlign: 'left', overflow: 'hidden' }}>
      {/* Hotel Small Cover */}
      <div style={{ width: '120px', height: '120px', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
        <img 
          src={getHotelImagePlaceholder(booking.hotelId)} 
          alt={booking.hotelName} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Booking Details */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '6px' }}>
        <div className="flex-between">
          <h4 style={{ fontSize: '18px', margin: 0 }}>{booking.hotelName}</h4>
          {getStatusBadge(booking.bookingStatus)}
        </div>
        
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
          Reservation Code: <strong style={{ color: 'var(--text-active)' }}>{booking.reservationNumber}</strong>
        </p>

        <div style={{ display: 'flex', gap: '24px', margin: '6px 0', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Check In</span>
            <p style={{ fontSize: '14px', fontWeight: 500 }}>{booking.checkInDate}</p>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Check Out</span>
            <p style={{ fontSize: '14px', fontWeight: 500 }}>{booking.checkOutDate}</p>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Room</span>
            <p style={{ fontSize: '14px', fontWeight: 500 }}>#{booking.roomNumber}</p>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Spent</span>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-cyan)' }}>${booking.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Cancellation Trigger */}
        {booking.bookingStatus === 'CONFIRMED' && (
          <div style={{ marginTop: '4px', alignSelf: 'flex-start' }}>
            <button 
              onClick={() => onCancel(booking.id)}
              className="btn btn-danger"
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              Cancel Reservation
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 600px) {
          flex-direction: column !important;
          align-items: stretch !important;
        }
      `}</style>
    </div>
  );
};

export default BookingCard;
