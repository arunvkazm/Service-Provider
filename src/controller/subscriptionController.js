const subscriptionModel = require("../model/subscriptionModel");
const { sendResponse } = require("../utils/responseHelper");

exports.createSubscription = async (req, res) => {
  const { name, description, price, duration, isActive } = req.body;

  try {
    
    const plan = new subscriptionModel({ 
      name, 
      description, 
      price, 
      duration, 
      isActive: isActive !== undefined ? isActive : undefined
    });

    await plan.save();

    sendResponse(
      res,
      201,
      true,
      "Subscription plan created successfully",
      plan
    );
  } catch (error) {
    sendResponse(res, 500, false, "Error creating subscription");
  }
};


exports.getAllSubscription = async (req, res) => {
  try {
    const subscription = await subscriptionModel.find();

    // Check if no subscription plans are found
    if (!subscription || subscription.length === 0) {
      return sendResponse(res, 404, false, "Subscription Plans not found");
    }

    // If subscriptions are found, send them in the response
    sendResponse(
      res,
      200,
      true,
      "Subscription Plans retrieved successfully",
      subscription
    );
  } catch (error) {
    // Handle unexpected errors
    sendResponse(res, 500, false, "Error getting subscription plans");
  }
};


exports.getSubscriptionById = async (req, res) => {
   const subscriptionId = req.params.id;
    try {
        const subscription = await subscriptionModel.findById(subscriptionId);
        if (!subscription) {
            return res.sendResponse(
                res,
                404,
                false,
                "Subscription plan not found"
            );
        }
        sendResponse(res, 200, true, "Subscription plan retrieved successfully", subscription);
    } catch (error) {
        next(error);
    }
}

exports.updateSubscription = async (req, res) => {
  const { name, description, price, duration, isActive } = req.body;
  const subscriptionId = req.params.id;

  try {
    // Find the subscription plan by ID
    const subscription = await subscriptionModel.findById(subscriptionId);

    if (!subscription) {
      return sendResponse(res, 404, false, "Subscription plan not found");
    }

    // Update the subscription fields with provided values or retain existing ones
    subscription.name = name ?? subscription.name;
    subscription.description = description ?? subscription.description;
    subscription.price = price ?? subscription.price;
    subscription.duration = duration ?? subscription.duration;
    subscription.isActive = isActive ?? subscription.isActive;

    // Save the updated subscription
    await subscription.save();

    sendResponse(
      res,
      200,
      true,
      "Subscription plan updated successfully",
      subscription
    );
  } catch (error) {
    sendResponse(res, 500, false, "Failed to update subscription plan");
  }
};

  
  exports.deleteSubscription = async (req, res) => {
    const subscriptionId = req.params.id; 
  
    try {
      // Find the ad by ID
      const subscription = await subscriptionModel.findById(subscriptionId);
      if (!subscription) {
        return sendResponse(res, 404, false, "Subscription plan not found");
      }

      await subscriptionModel.findByIdAndDelete(subscriptionId);
  
      sendResponse(res, 200, true, "Subscription plan deleted successfully");
    } catch (error) {
      console.error(error); 
      sendResponse(res, 500, false, "Failed to delete subscription plan");
    }
  }
