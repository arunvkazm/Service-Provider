const mongoose = require('mongoose');

const IndustrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, 
        trim: true,
    },
    businessType: {
        type: [String], 
        default: [],
    },
}, { timestamps: true });

module.exports = mongoose.model('Industry', IndustrySchema);
