import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ShieldCheck,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from 'lucide-react';

const AdminPanel = () => {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'roster'
  const [trainers, setTrainers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Load all data
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [trainersRes, bookingsRes] = await Promise.all([
        api.getTrainers(),
        api.getAllBookings(token),
      ]);

      if (trainersRes.success) setTrainers(trainersRes.trainers || []);
      if (bookingsRes.success) setBookings(bookingsRes.bookings || []);
    } catch (err) {
      setError(err.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Handle status update for a booking
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await api.updateBookingStatus(bookingId, newStatus, token);
      if (response.success) {
        setNotification(`Booking status successfully changed to "${newStatus}"`);
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, status: newStatus } : b
          )
        );
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update booking status.');
      setTimeout(() => setError(''), 4000);
    }
  };

  // Handle trainer availability toggle
  const handleToggleTrainerAvailability = async (trainerId, currentStatus) => {
    try {
      const response = await api.toggleTrainerAvailability(
        trainerId,
        !currentStatus,
        token
      );
      if (response.success) {
        setNotification(`Trainer availability updated successfully.`);
        setTrainers((prev) =>
          prev.map((t) =>
            t._id === trainerId ? { ...t, available: !currentStatus } : t
          )
        );
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update trainer availability.');
      setTimeout(() => setError(''), 4000);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <header className="page-header">
        <h1 className="page-title">
          ADMIN <span style={{ color: 'var(--primary)' }}>PANEL</span>
        </h1>
        <p className="page-subtitle">
          Manage trainer schedules, availability rosters, and member class reservations.
        </p>
      </header>

      {/* Notifications */}
      {notification && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Admin Tab Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className={`btn ${
              activeTab === 'bookings' ? 'btn-primary' : 'btn-outline'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            <Calendar size={16} />
            <span>Booking Management ({bookings.length})</span>
          </button>
          <button
            type="button"
            className={`btn ${
              activeTab === 'roster' ? 'btn-primary' : 'btn-outline'
            }`}
            onClick={() => setActiveTab('roster')}
          >
            <Users size={16} />
            <span>Trainer Roster ({trainers.length})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="btn btn-outline btn-sm"
          title="Refresh data"
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading administrative data...</p>
        </div>
      )}

      {/* 1. Bookings Tab */}
      {!loading && activeTab === 'bookings' && (
        <section>
          {bookings.length === 0 ? (
            <div className="empty-state card">
              <h3>No bookings found in the system.</h3>
            </div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Class</th>
                    <th>Trainer</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Manage Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const memberName =
                      booking.memberId?.name || 'Member Account';
                    const memberEmail = booking.memberId?.email || '';
                    const trainerName =
                      booking.trainerId?.name || 'Assigned Trainer';

                    return (
                      <tr key={booking._id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong>{memberName}</strong>
                            <span
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                              }}
                            >
                              {memberEmail}
                            </span>
                          </div>
                        </td>
                        <td>{booking.className}</td>
                        <td>{trainerName}</td>
                        <td>
                          <div>{booking.date}</div>
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {booking.timeSlot}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`booking-status-badge ${booking.status}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          <select
                            className="select-field"
                            style={{
                              padding: '0.35rem 0.6rem',
                              fontSize: '0.85rem',
                              width: 'auto',
                            }}
                            value={booking.status}
                            onChange={(e) =>
                              handleStatusChange(booking._id, e.target.value)
                            }
                          >
                            <option value="booked">Booked</option>
                            <option value="attended">Attended</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* 2. Trainer Roster Tab */}
      {!loading && activeTab === 'roster' && (
        <section>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trainer Name</th>
                  <th>Specialization</th>
                  <th>Current Availability</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {trainers.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <strong>{t.name}</strong>
                    </td>
                    <td>{t.specialization}</td>
                    <td>
                      <span
                        className={`availability-badge ${
                          t.available ? 'available' : 'unavailable'
                        }`}
                      >
                        <span className="status-dot"></span>
                        {t.available ? 'Available' : 'Fully Booked'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleTrainerAvailability(t._id, t.available)
                        }
                        className={`btn btn-sm ${
                          t.available ? 'btn-outline' : 'btn-primary'
                        }`}
                      >
                        {t.available ? (
                          <>
                            <ToggleLeft size={16} /> Mark as Fully Booked
                          </>
                        ) : (
                          <>
                            <ToggleRight size={16} /> Mark as Available
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminPanel;
