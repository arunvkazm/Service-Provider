const businessModel = require('../model/businessModel');
const {sendResponse} = require('../utils/responseHelper');

// Create a new industry
exports.createBusiness = async (req, res, next) => {
    try {
        const { name } = req.body;

        const business = await businessModel.create({ name});
        sendResponse(
            res, 201, true,
            "Business created successfully",
            business
        );
    
    } catch (error) {
        sendResponse(
            res, 500, false,
            "Failed to create business"
        );
    }
};

// Get all industries
exports.getAllBusiness = async (req, res, next) => {
    try {
        const business = await businessModel.find();
        sendResponse(
            res, 200, true,
            "Businesses retrieved successfully",
            business
        );
    } catch (error) {
        sendResponse(
            res, 500, false,
            "Failed to retrieve businesses"
        );
    
    }
};

// Get a single industry by ID
exports.getBusinessById = async (req, res, next) => {
    try {
        const business = await businessModel.findById(req.params.id);
        if (!business) {
            sendResponse(
                res, 404, false,
                "Business not found"
            );
        }
        sendResponse(
            res, 200, true,
            "Business retrieved successfully",
            business
        );
    
    } catch (error) {
        sendResponse(
            res, 500, false,
            "Failed to retrieve business"
        );
    }
};

// Update an industry
exports.updateBusiness = async (req, res, next) => {
    try {
        const { name } = req.body;

        const business = await businessModel.findByIdAndUpdate(
            req.params.id,
            { name},
            { new: true, runValidators: true }
        );

        if (!business) {
            sendResponse(
                res, 404, false,
                "Business not found"
            );
        }

        sendResponse(
            res, 200, true,
            "Business updated successfully",
            business
        );
    } catch (error) {
        sendResponse(
            res, 500, false,
            "Failed to update business"
        );
    }
};

// Delete an industry
exports.deleteBusiness = async (req, res, next) => {
    try {
        const business = await businessModel.findByIdAndDelete(req.params.id);
        if (!business) {
            sendResponse(
                res, 404, false,
                "Business not found"
            );
        }
        sendResponse(
            res, 200, true,
            "Business deleted successfully"
        );
    } catch (error) {
        sendResponse(
            res, 500, false,
            "Failed to delete business"
        );
    }
};
