const express = require("express");
const User = require("../model/userModel");
const { sendResponse } = require("../utils/responseHelper");


exports.location = async  (req, res, next) => {
    try {
        const { userId, latitude, longitude } = req.body;

        // Validation
        if (!userId || !latitude || !longitude) {
            return sendResponse(res, 400, "Missing required fields: userId, latitude, or longitude.");
        }

        // Find the user by ID and update location
        const user = await User.findById(userId);

        if (!user) {
            return sendResponse(res, 404, "User not found.");
        }

        // Update the user's location
        user.location = {
            latitude,
            longitude,
        };

        await user.save();

        return sendResponse(res, 200, "Location updated successfully.", user);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "An error occurred while updating the location.");
    }

}

