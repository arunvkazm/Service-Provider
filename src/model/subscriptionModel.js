const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: String, enum: ["monthly", "yearly"], required: true },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
