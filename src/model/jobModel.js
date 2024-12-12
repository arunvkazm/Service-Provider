const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true },
    location: { type: String, required: true },
    estimatedBudget: { type: Number, required: true },
    radius: { type: Number, required: true }, // Assuming radius in kilometers/miles
    serviceType: { type: String, required: true },
    service: { type: String, required: true },
    timeframe: {
      from: { type: Date, required: true },
      to: { type: Date, required: true },
    },
    images: { type: [String], default: [] }, // Array to store file paths/URLs
    requirements: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
