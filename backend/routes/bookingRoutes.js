const express = require('express');
const router = express.Router();
const ClassBooking = require('../models/ClassBooking');
const authGuard = require('../middleware/authGuard');

/**
 * @route   POST /api/v1/bookings
 * @desc    Create a new gym class booking
 * @access  Protected (Requires Bearer Token)
 */
router.post('/', authGuard, async (req, res, next) => {
  try {
    const { memberId, trainerId, className, date, timeSlot } = req.body;

    // Use memberId from body or fall back to authenticated member's ID
    const effectiveMemberId = memberId || req.member._id;

    // Create Mongoose document which triggers schema validation
    const newBooking = new ClassBooking({
      memberId: effectiveMemberId,
      trainerId,
      className,
      date,
      timeSlot,
      status: 'booked',
    });

    const savedBooking = await newBooking.save();

    // Populate trainer and member details for immediate rich response
    const populatedBooking = await ClassBooking.findById(savedBooking._id)
      .populate('memberId', 'name email')
      .populate('trainerId', 'name specialization');

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/bookings/my
 * @desc    Get all bookings for the currently authenticated member
 * @access  Protected (Requires Bearer Token)
 */
router.get('/my', authGuard, async (req, res, next) => {
  try {
    const bookings = await ClassBooking.find({ memberId: req.member._id })
      .populate('memberId', 'name email')
      .populate('trainerId', 'name specialization')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/bookings
 * @desc    Get all bookings (for Admin Panel)
 * @access  Protected (Requires Bearer Token)
 */
router.get('/', authGuard, async (req, res, next) => {
  try {
    const bookings = await ClassBooking.find()
      .populate('memberId', 'name email')
      .populate('trainerId', 'name specialization')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/v1/bookings/:id/status
 * @desc    Update booking status (booked, attended, cancelled)
 * @access  Protected (Requires Bearer Token)
 */
router.patch('/:id/status', authGuard, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['booked', 'attended', 'cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          `Invalid status '${status}'. Allowed statuses are: ${allowedStatuses.join(', ')}`,
        ],
      });
    }

    const booking = await ClassBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        errors: ['Booking with the provided ID does not exist'],
      });
    }

    booking.status = status;
    const updatedBooking = await booking.save();

    const populatedBooking = await ClassBooking.findById(updatedBooking._id)
      .populate('memberId', 'name email')
      .populate('trainerId', 'name specialization');

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
