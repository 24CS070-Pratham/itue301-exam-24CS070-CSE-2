/**
 * Global Error Handler Middleware
 * Formats errors into clean, structured JSON without leaking raw stack traces.
 */
const errorHandler = (err, req, res, next) => {
  // Check if error is a Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors,
    });
  }

  // Handle Mongoose Duplicate Key Error (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      success: false,
      message: `A record with this ${field} already exists`,
      errors: [`Duplicate value for ${field}`],
    });
  }

  // Handle Invalid Mongoose ObjectId format (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid format for ${err.path}`,
      errors: [`Resource not found or invalid identifier`],
    });
  }

  // General server error
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: [err.message || 'An unexpected error occurred'],
  });
};

module.exports = errorHandler;
