// Centralized Express error handling middleware
// Use this to standardize API errors and keep routes/controllers clean.
// 1) notFound: catches any unmatched route (404)
// 2) errorHandler: catches thrown/next(err) errors

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const response = {
    success: false,
    error: err.name || 'Error',
    message: err.message || 'Internal Server Error'
  };

  // Include our own validation/errors details when available
  if (err.errors) {
    response.details = err.errors;
  }

  // In development, return stack for debugging
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFound,
  errorHandler
};
