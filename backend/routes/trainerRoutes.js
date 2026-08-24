const express = require('express');
const router = express.Router();
const Trainer = require('../models/Trainer');

/**
 * @route   GET /api/v1/trainers
 * @desc    Get all trainers with their specialization and availability
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const trainers = await Trainer.find().sort({ createdAt: 1 });
    return res.status(200).json({
      success: true,
      count: trainers.length,
      trainers,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/trainers
 * @desc    Create a new trainer (Admin / Setup)
 * @access  Public
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, specialization, available } = req.body;
    const trainer = new Trainer({
      name,
      specialization,
      available: available !== undefined ? available : true,
    });

    const savedTrainer = await trainer.save();
    return res.status(201).json({
      success: true,
      trainer: savedTrainer,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/v1/trainers/:id/availability
 * @desc    Toggle or update trainer availability
 * @access  Public / Admin
 */
router.patch('/:id/availability', async (req, res, next) => {
  try {
    const { available } = req.body;
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found',
        errors: ['Trainer with given ID does not exist'],
      });
    }

    trainer.available = available !== undefined ? available : !trainer.available;
    await trainer.save();

    return res.status(200).json({
      success: true,
      message: `Trainer availability updated to ${trainer.available ? 'Available' : 'Fully Booked'}`,
      trainer,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
