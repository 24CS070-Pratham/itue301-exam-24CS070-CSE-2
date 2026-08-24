const mongoose = require('mongoose');

const classBookingSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member ID is required'],
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: [true, 'Trainer ID is required'],
    },
    className: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Booking date is required'],
      trim: true,
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['booked', 'attended', 'cancelled'],
        message: 'Status must be either booked, attended, or cancelled',
      },
      default: 'booked',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ClassBooking', classBookingSchema);
