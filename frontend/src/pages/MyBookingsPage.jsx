import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const MyBookingsPage = () => {
  const { token, member } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchMyBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMyBookings(token);
      if (data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      } else {
        setError('Failed to retrieve your bookings.');
      }
    } catch (err) {
      setError(err.message || 'Error loading bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyBookings();
    }
  }, [token]);

  // Handle cancellation
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await api.updateBookingStatus(bookingId, 'cancelled', token);
      if (response.success) {
        setActionMessage('Booking was successfully cancelled.');
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, status: 'cancelled' } : b
          )
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel booking.');
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <header className="page-header">
        <h1 className="page-title">
          MY <span style={{ color: 'var(--primary)' }}>BOOKINGS</span>
        </h1>
        <p className="page-subtitle">
          View your upcoming workout sessions, attendance records, and manage your schedule.
        </p>
      </header>

      {/* Action Messages */}
      {actionMessage && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && bookings.length === 0 && (
        <div className="empty-state card">
          <BookOpen className="empty-icon" />
          <h3>You have no bookings yet.</h3>
          <p style={{ margin: '0.75rem 0 1.5rem', color: 'var(--text-muted)' }}>
            Ready to break a sweat? Explore our trainer schedules and book your first class.
          </p>
          <Link to="/classes" className="btn btn-primary">
            Browse Classes & Book Now
          </Link>
        </div>
      )}

      {/* Bookings List / Table */}
      {!loading && !error && bookings.length > 0 && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Trainer & Specialization</th>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const trainerName =
                  booking.trainerId?.name || 'Assigned Trainer';
                const trainerSpec =
                  booking.trainerId?.specialization || 'Fitness';
                const status = booking.status || 'booked';

                return (
                  <tr key={booking._id}>
                    <td>
                      <strong style={{ color: '#ffffff', fontSize: '1rem' }}>
                        {booking.className}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{trainerName}</span>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {trainerSpec}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Calendar size={14} color="var(--primary)" />
                        <span>{booking.date}</span>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Clock size={14} color="var(--accent-cyan)" />
                        <span>{booking.timeSlot}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`booking-status-badge ${status}`}>
                        {status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {status === 'booked' && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(booking._id)}
                          className="btn btn-sm btn-outline"
                          style={{
                            color: '#f87171',
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                          }}
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      )}
                      {status !== 'booked' && (
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-dim)',
                          }}
                        >
                          No action
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
