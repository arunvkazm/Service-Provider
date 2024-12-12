const jobModel = require("../model/jobModel");
const { sendResponse } = require("../utils/responseHelper");
const cloudinary = require("../utils/cloudinaryHelper");


exports.createJob = async (req, res) => {
  const {
    jobTitle,
    location,
    estimatedBudget,
    radius,
    serviceType,
    service,
    timeframeFrom,
    timeframeTo,
    requirements,
  } = req.body;

  if (!req.files || req.files.length === 0) {
    return sendResponse(res, 400, false, "Images are required");
  }

  try {
    // const result = await cloudinary.uploader.upload(req.file.path, {
    //   folder: "jobs",
    // });
    const images = req.files
      ? await Promise.all(
          req.files.map((file) => cloudinary.uploadToCloudinary(file.path, "jobs"))
        )
      : [];

      console.log(images);

    const newJob = new jobModel({
      jobTitle,
      location,
      estimatedBudget,
      radius,
      serviceType,
      service,
      timeframe: { from: timeframeFrom, to: timeframeTo },
      requirements,
      images: images,
    });

    await newJob.save();

    sendResponse(res, 201, true, "Job created successfully", newJob);
  } catch (error) {
    console.error("Error creating job:", error);
    sendResponse(res, 500, false, "Failed to create job");
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await jobModel.find();
    if (!jobs || jobs.length === 0) {
      return sendResponse(res, 404, false, "No jobs found");
    }
    sendResponse(res, 200, true, "Jobs retrieved successfully", jobs);
  } catch (error) {
    sendResponse(res, 500, false, error.message || "Failed to get jobs");
  }
};

exports.getJobById = async (req, res) => {
  const jobId = req.params.id;

  try {
    const job = await jobModel.findById(jobId);
    if (!job) {
      return sendResponse(res, 404, false, "Job not found");
    }
    sendResponse(res, 200, true, "Job retrieved successfully", job);
  } catch (error) {
    sendResponse(res, 500, false, error.message || "Failed to get job");
  }
};

exports.updateJob = async (req, res) => {
  const jobId = req.params.id;

  try {
    const {
      jobTitle,
      location,
      estimatedBudget,
      radius,
      serviceType,
      service,
      timeframeFrom,
      timeframeTo,
      requirements,
    } = req.body;

    // Fetch the existing job from the database
    const job = await jobModel.findById(jobId);
    if (!job) {
      return sendResponse(res, 404, false, "Job not found");
    }

    let updatedimages = job.images; // Default to existing images

    // Check if files were uploaded
    if (req.files && req.files.length > 0) {
      // Delete existing images from Cloudinary
      if (job.images && job.images.length > 0) {
        await Promise.all(
          job.images.map((image) => deleteFromCloudinary(image, "jobs"))
        );
      }

      // Upload new images to Cloudinary
      const uploadedImages = await Promise.all(
        req.files.map((file) =>
          uploadToCloudinary(file.path, "jobs").catch((err) => {
            console.error("Failed to upload to Cloudinary:", err);
            return null; // Handle upload failure gracefully
          })
        )
      );

      // Filter out any null or invalid uploads
      updatedimages = uploadedImages.filter((image) => image && image.secure_url);
    }

    // Update job fields (retain existing values if not provided)
    job.jobTitle = jobTitle || job.jobTitle;
    job.location = location || job.location;
    job.estimatedBudget = estimatedBudget || job.estimatedBudget;
    job.radius = radius || job.radius;
    job.serviceType = serviceType || job.serviceType;
    job.service = service || job.service;
    job.timeframe.from = timeframeFrom || job.timeframe.from;
    job.timeframe.to = timeframeTo || job.timeframe.to;
    job.requirements = requirements || job.requirements;
    job.images = updatedimages; // Assign updated or existing images

    // Save the updated job
    await job.save();

    sendResponse(res, 200, true, "Job updated successfully", job);
  } catch (error) {
    console.error("Error updating job:", error);
    sendResponse(res, 500, false, error.message || "Failed to update job");
  }
};


exports.deleteJob = async (req, res) => {
  const jobId = req.params.id;

  try {
    const job = await jobModel.findById(jobId);
    if (!job) {
      return sendResponse(res, 404, false, "Job not found");
    }

    // Delete documents from Cloudinary
    await Promise.all(
      job.documents.map((doc) => cloudinary.deleteFromCloudinary(doc, "jobs"))
    );

    await jobModel.findByIdAndDelete(jobId);
    sendResponse(res, 200, true, "Job deleted successfully");
  } catch (error) {
    sendResponse(res, 500, false, error.message || "Failed to delete job");
  }
};
