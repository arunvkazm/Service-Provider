const logger = require('../config/logger'); // Your Winston logger

// Global Error Handler
const errorHandler = (err, req, res, next) => {
    // Log the error for debugging
    logger.error({
        message: err.message,
        stack: err.stack,
        status: err.status || 500,
        method: req.method,
        route: req.originalUrl,
    });

    // Define response structure
    const statusCode = err.status || 500; // Default to 500 if status not set
    const errorResponse = {
        success: false,
        message: err.message || 'Internal Server Error',
    };

    // Add error details in development mode
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }

    res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
