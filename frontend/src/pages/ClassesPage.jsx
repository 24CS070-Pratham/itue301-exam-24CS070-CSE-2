import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import TrainerCard from '../components/TrainerCard';
import {
  Search,
  Calendar as CalendarIcon,
  Clock,
  Dumbbell,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const ClassesPage = () => {
  const { member, token } = useAuth();

  // Trainer list states
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search filter state (filters locally, does NOT re-fetch)
  const [searchTerm, setSearchTerm] = useState('');

  // Booking form controlled states
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [className, setClassName] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');

  // Form submission feedback states
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Available Time Slots list
  const timeSlots = [
    '06:00 AM - 07:00 AM',
    '07:00 AM - 08:00 AM',
    '08:30 AM - 09:30 AM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM',
    '07:30 PM - 08:30 PM',
  ];

  // Common Class Types
  const classSuggestions = [
    'Strength & Conditioning',
    'HIIT Cardio Blast',
    'Vinyasa Power Yoga',
    'Core & Pilates Sculpt',
    'CrossFit Fundamentals',
    'Boxing & Functional Fitness',
  ];

  // Fetch trainers on mount
  useEffect(() => {
    let isMounted = true;

    const fetchTrainers = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getTrainers();
        if (isMounted) {
          if (data.success && Array.isArray(data.trainers)) {
            setTrainers(data.trainers);
          } else {
            setError('Failed to load trainers.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load trainers.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTrainers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter trainers locally based on specialization
  const filteredTrainers = trainers.filter((t) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      (t.specialization && t.specialization.toLowerCase().includes(term)) ||
      (t.name && t.name.toLowerCase().includes(term))
    );
  });

  // Handle booking form submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingSuccess('');
    setBookingError('');

    if (!selectedTrainer) {
      setBookingError('Please select a trainer.');
      return;
    }
    if (!className.trim()) {
      setBookingError('Please enter or choose a class name.');
      return;
    }
    if (!date) {
      setBookingError('Please select a date.');
      return;
    }
    if (!timeSlot) {
      setBookingError('Please choose a time slot.');
      return;
    }

    // Find trainer ID
    const trainerObj = trainers.find((t) => t.name === selectedTrainer);
    if (!trainerObj) {
      setBookingError('Selected trainer is invalid.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        memberId: member?._id,
        trainerId: trainerObj._id,
        className: className.trim(),
        date,
        timeSlot,
      };

      const response = await api.createBooking(payload, token);

      if (response.success) {
        setBookingSuccess(
          `Booking confirmed for "${className}" with ${selectedTrainer} on ${date} (${timeSlot})!`
        );
        // Reset form fields
        setClassName('');
        setDate('');
        setTimeSlot('');
        setSelectedTrainer('');
      } else {
        setBookingError(response.message || 'Failed to create booking.');
      }
    } catch (err) {
      setBookingError(err.message || 'Validation error while booking class.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      {/* Page Header */}
      <header className="page-header">
        <h1 className="page-title">
          TRAINER-LED <span style={{ color: 'var(--primary)' }}>CLASS BOOKING</span>
        </h1>
        <p className="page-subtitle">
          Welcome back, <strong>{member?.name || 'Member'}</strong>! Browse our expert
          trainers, check real-time availability, and reserve your workout slot.
        </p>
      </header>

      {/* Specialization Search Bar */}
      <section className="search-section">
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={20} />
          <input
            id="trainer-search-input"
            type="text"
            className="search-input"
            placeholder="Search by specialization (e.g. Strength, Yoga, HIIT, Pilates)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* Trainer Cards Section */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h2>Our Certified Trainers</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {filteredTrainers.length} of {trainers.length} trainers
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading trainers...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredTrainers.length === 0 && (
          <div className="empty-state card">
            <Dumbbell className="empty-icon" />
            <h3>No trainers found</h3>
            <p style={{ marginTop: '0.5rem' }}>
              {searchTerm
                ? `No trainers match the specialization "${searchTerm}". Try a different search.`
                : 'No trainers available at this time.'}
            </p>
          </div>
        )}

        {/* Trainer Grid */}
        {!loading && !error && filteredTrainers.length > 0 && (
          <div className="trainers-grid">
            {filteredTrainers.map((trainer) => (
              <TrainerCard
                key={trainer._id || trainer.name}
                name={trainer.name}
                specialization={trainer.specialization}
                available={trainer.available}
                isSelected={selectedTrainer === trainer.name}
                onSelect={(trainerName) => {
                  setSelectedTrainer(trainerName);
                  setBookingError('');
                  // Scroll to form smoothly
                  document
                    .getElementById('booking-form-section')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Class Booking Form Section */}
      <section id="booking-form-section" className="booking-section">
        <div className="booking-section-header">
          <div>
            <h2>Book Your Workout Class</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Fill in the details below to reserve your spot with your preferred trainer.
            </p>
          </div>
          <Sparkles color="var(--primary)" size={24} />
        </div>

        {/* Live Dynamic Selection Preview (Meaningful State Usage) */}
        <div className="live-selection-summary">
          <div className="summary-item">
            Selected Trainer:{' '}
            <strong>{selectedTrainer || '(None Selected)'}</strong>
          </div>
          <div className="summary-item">
            Selected Class:{' '}
            <strong>{className || '(None Chosen)'}</strong>
          </div>
          <div className="summary-item">
            Selected Date:{' '}
            <strong>{date || '(No Date)'}</strong>
          </div>
          <div className="summary-item">
            Selected Time:{' '}
            <strong>{timeSlot || '(No Time Slot)'}</strong>
          </div>
        </div>

        {/* Booking Feedback Alerts */}
        {bookingSuccess && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{bookingSuccess}</span>
          </div>
        )}

        {bookingError && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{bookingError}</span>
          </div>
        )}

        <form onSubmit={handleBookingSubmit}>
          <div className="booking-form-grid">
            {/* 1. Trainer Selection */}
            <div className="input-group">
              <label className="input-label" htmlFor="booking-trainer">
                Trainer
              </label>
              <select
                id="booking-trainer"
                className="select-field"
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
                required
              >
                <option value="">-- Choose a Trainer --</option>
                {trainers.map((t) => (
                  <option
                    key={t._id || t.name}
                    value={t.name}
                    disabled={!t.available}
                  >
                    {t.name} ({t.specialization}) {t.available ? '✔' : '❌ (Full)'}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Class Name Selection / Input */}
            <div className="input-group">
              <label className="input-label" htmlFor="booking-classname">
                Class Name
              </label>
              <input
                id="booking-classname"
                type="text"
                list="class-suggestions"
                className="input-field"
                placeholder="e.g. HIIT Cardio Blast"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
              />
              <datalist id="class-suggestions">
                {classSuggestions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* 3. Date Selection */}
            <div className="input-group">
              <label className="input-label" htmlFor="booking-date">
                Date
              </label>
              <input
                id="booking-date"
                type="date"
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* 4. Time Slot Selection */}
            <div className="input-group">
              <label className="input-label" htmlFor="booking-timeslot">
                Time Slot
              </label>
              <select
                id="booking-timeslot"
                className="select-field"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                required
              >
                <option value="">-- Select Time Slot --</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: '100%', padding: '0.9rem' }}
          >
            {submitting ? (
              <span>Submitting Booking...</span>
            ) : (
              <>
                <CalendarIcon size={18} />
                <span>CONFIRM & BOOK CLASS</span>
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
};

export default ClassesPage;
