import React from 'react';
import { User, Award, CheckCircle, XCircle } from 'lucide-react';

/**
 * Reusable TrainerCard Component
 * @param {string} name - Trainer full name
 * @param {string} specialization - Trainer fitness specialization
 * @param {boolean} available - Trainer current availability
 * @param {boolean} isSelected - Whether this card is selected in booking form
 * @param {function} onSelect - Callback when card is selected
 */
const TrainerCard = ({
  name,
  specialization,
  available,
  isSelected = false,
  onSelect,
}) => {
  // Get initials for avatar
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'TR';

  return (
    <div
      className={`trainer-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect && available ? () => onSelect(name) : undefined}
      style={{ cursor: onSelect && available ? 'pointer' : 'default' }}
    >
      <div className="trainer-card-header">
        <div className="trainer-avatar">{initials}</div>
        <div
          className={`availability-badge ${
            available ? 'available' : 'unavailable'
          }`}
        >
          <span className="status-dot"></span>
          <span>{available ? 'Available' : 'Fully Booked'}</span>
        </div>
      </div>

      <div>
        <h3 className="trainer-name">{name}</h3>
        <p className="trainer-specialization">
          <Award size={15} />
          <span>{specialization}</span>
        </p>
      </div>

      {onSelect && (
        <button
          type="button"
          disabled={!available}
          className={`btn btn-sm ${
            isSelected
              ? 'btn-primary'
              : available
              ? 'btn-outline'
              : 'btn-outline'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (available && onSelect) onSelect(name);
          }}
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          {isSelected ? (
            <>
              <CheckCircle size={15} /> Selected
            </>
          ) : available ? (
            'Select Trainer'
          ) : (
            'Unavailable'
          )}
        </button>
      )}
    </div>
  );
};

export default TrainerCard;
