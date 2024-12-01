const http = require('http');
const app = require('./app'); // Import the Express app
const logger = require('./src/config/logger'); // Import logger for logging important events

// Get port from environment variables or default to 3000
const PORT = process.env.PORT || 3000;

// Create the server
const server = http.createServer(app);

// Start the server
server.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection: ${reason}`);
    server.close(() => process.exit(1));
});
