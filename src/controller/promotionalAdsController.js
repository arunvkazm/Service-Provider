const cloudinary = require('cloudinary').v2;
const PromotionalAd = require("../model/promotionalAdsModel"); // Make sure to import your PromotionalAd model
const { sendResponse } = require("../utils/responseHelper");

// // Ensure that Cloudinary is properly configured in the environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.addPromotionalAd = async (req, res) => {
  const { title, description, targetAudience } = req.body;

  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Image file is required" });
  }

  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "promotional_ads",
    });

    // Save ad in the database
    const newAd = new PromotionalAd({
      title,
      description,
      image: result.secure_url,
      targetAudience,
      // createdBy: req.user.id,
    });

    await newAd.save();

    sendResponse(res, 201, true, "Promotional ad created successfully", newAd);
  } catch (error) {
    sendResponse(
      res,
      500,
      false,
      "Failed to create promotional ad"
    );
  }
};

exports.getPromotionalAds = async (req, res) => {
  try {
    const ads = await PromotionalAd.find();
    if (!ads) {
      return 
      sendResponse(
          res,404,false,"Promotional Ads not found"
      );
    
    }
    sendResponse(res, 200, true, "Promotional ads retrieved successfully", ads);
  } catch (error) {
    sendResponse(
      res,
      500,
      false,
      "Failed to get promotional ads"
    );
  }
};


exports.updatePromotionalAds = async (req, res) => {

  const { title, description, targetAudience } = req.body;
  const adId = req.params.id;
  try {
    // Find the ad to be updated
    const ad = await PromotionalAd.findById(adId);
    if (!ad) {
      return sendResponse(res, 404, false, "Promotional ad not found");
    }

    let updatedImage = ad.image; 

    // If a new file is uploaded, upload it to Cloudinary
    if (req.file) {
      // Delete the old image from Cloudinary if it exists
      const publicId = ad.image.split('/').pop().split('.')[0]; 
      
      await cloudinary.uploader.destroy(`promotional_ads/${publicId}`); 

      // Upload the new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'promotional_ads'
      });
      

      updatedImage = result.secure_url;
    }

    // Update the ad fields
    ad.title = title || ad.title;
    ad.description = description || ad.description;
    ad.targetAudience = targetAudience || ad.targetAudience;
    ad.image = updatedImage;

    await ad.save(); 

    sendResponse(res, 200, true, "Promotional ad updated successfully", ad);
  } catch (error) {
  
    sendResponse(res, 500, false, "Failed to update promotional ad");
  }
};

exports.deletePromotionalAds = async (req, res) => {
  const adId = req.params.id; 

  try {
    // Find the ad by ID
    const ad = await PromotionalAd.findById(adId);
    if (!ad) {
      return sendResponse(res, 404, false, "Promotional ad not found");
    }

    const publicId = ad.image.split('/').pop().split('.')[0]; 
    await cloudinary.uploader.destroy(`promotional_ads/${publicId}`); 

    await PromotionalAd.findByIdAndDelete(adId);

    sendResponse(res, 200, true, "Promotional ad deleted successfully");
  } catch (error) {
    console.error(error); // Log for debugging
    sendResponse(res, 500, false, "Failed to delete promotional ad");
  }
}