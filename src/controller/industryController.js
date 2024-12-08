const Industry = require('../model/industryModel');

// Create a new industry
exports.createIndustry = async (req, res, next) => {
    try {
        const { name } = req.body;

        const industry = await Industry.create({ name});
        res.status(201).json({ success: true, data: industry });
    } catch (error) {
        next(error); // Pass to error handler
    }
};

// Get all industries
exports.getIndustries = async (req, res, next) => {
    try {
        const industries = await Industry.find();
        res.status(200).json({ success: true, data: industries });
    } catch (error) {
        next(error);
    }
};

// Get a single industry by ID
exports.getIndustryById = async (req, res, next) => {
    try {
        const industry = await Industry.findById(req.params.id);
        if (!industry) {
            return res.status(404).json({ success: false, message: 'Industry not found' });
        }
        res.status(200).json({ success: true, data: industry });
    } catch (error) {
        next(error);
    }
};

// Update an industry
exports.updateIndustry = async (req, res, next) => {
    try {
        const { name } = req.body;

        const industry = await Industry.findByIdAndUpdate(
            req.params.id,
            { name},
            { new: true, runValidators: true }
        );

        if (!industry) {
            return res.status(404).json({ success: false, message: 'Industry not found' });
        }

        res.status(200).json({ success: true, data: industry });
    } catch (error) {
        next(error);
    }
};

// Delete an industry
exports.deleteIndustry = async (req, res, next) => {
    try {
        const industry = await Industry.findByIdAndDelete(req.params.id);
        if (!industry) {
            return res.status(404).json({ success: false, message: 'Industry not found' });
        }
        res.status(200).json({ success: true, message: 'Industry deleted successfully' });
    } catch (error) {
        next(error);
    }
};
