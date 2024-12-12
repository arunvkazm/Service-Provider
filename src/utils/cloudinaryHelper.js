const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder });
    return result.secure_url; // Return file URL
  } catch (error) {
    throw new Error("Cloudinary upload failed");
  }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (fileUrl, folder) => {
  try {
    const publicId = `${folder}/${fileUrl.split('/').pop().split('.')[0]}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error("Cloudinary deletion failed");
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
