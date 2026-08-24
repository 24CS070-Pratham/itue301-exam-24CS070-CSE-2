require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Middlewares
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Import Seed Helper
const { seedInitialData } = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(cors());
app.use(express.json());

// Global Request Logger Middleware (runs for every request)
app.use(requestLogger);

// Health check route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FitZone Gym & Class Booking API',
  });
});

// Mount API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/trainers', trainerRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// Global Error Handler Middleware (MUST be last)
app.use(errorHandler);

/**
 * Connect to MongoDB and start Express server
 */
const startServer = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fitzone';

  try {
    console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:([^:@]{4,})@/, ':****@')}`);
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully.');

    // Seed default data if database is fresh
    try {
      await seedInitialData();
    } catch (seedErr) {
      console.warn('Auto-seed notice:', seedErr.message);
    }
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('Please verify your MONGO_URI in backend/.env');
  }

  app.listen(PORT, () => {
    console.log(`🚀 FitZone Backend Server is running on port ${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api/v1`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
