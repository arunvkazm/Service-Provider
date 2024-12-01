const mongoose = require('mongoose');
const logger = require('../config/logger');

const connectDB = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI);
      //  logger.info('MongoDB connected successfully');
    } catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1); // Exit the process with failure
    }
};

module.exports = connectDB; 
