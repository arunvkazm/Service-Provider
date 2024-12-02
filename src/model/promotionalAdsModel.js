const mongoose = require("mongoose");

const PromotionalAdSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }, 
  targetAudience: { type: String, enum: ["client", "service_provider"], required: true },
 // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PromotionalAd", PromotionalAdSchema);
