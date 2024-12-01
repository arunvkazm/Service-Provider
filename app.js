require('dotenv').config(); 
const express = require('express');
const morgan = require('morgan'); // For logging HTTP requests
const helmet = require('helmet'); // For securing HTTP headers
const cors = require('cors'); // For handling CORS
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db'); // MongoDB connection
// const logger = require('./src/config/logger'); // Winston logger
// const routes = require('./src/routes'); // Centralized routes
const errorHandler = require('./src/middleware/errorHandler'); // Global error handler

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded requests
app.use(morgan('dev')); // Log requests to the console
app.use(helmet()); // Set security-related HTTP headers
app.use(cors({ origin: process.env.CLIENT_URL })); // Allow CORS from the client app
app.use(passport.initialize()); // Initialize Passport for authentication

// Rate Limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', apiLimiter); // Apply to all API routes

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/admin/industries', require('./src/routes/industryRoutes')); // Authentication routes
// app.use('/api/users', require('./routes/userRoutes')); // User-related routes
// app.use('/api/jobs', require('./routes/jobRoutes')); // Job management routes
// app.use('/api/providers', require('./routes/providerRoutes')); // Service provider routes

// Fallback for unmatched routes
app.use((req, res, next) => {
    const error = new Error('Route Not Found');
    error.status = 404;
    next(error);
});

// Global Error Handler
app.use(errorHandler);

// Export app for testing and server.js
module.exports = app;
