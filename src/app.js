const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const transactionRoutes = require('./routes/transaction.routes');
// const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Finance Data Processing API is running',
    timestamp: new Date().toISOString()
  });
});

// Fallback route + centralized error middleware
const { notFound, errorHandler } = require('./middleware/error.middleware');

app.use(notFound);
app.use(errorHandler);

module.exports = app;