/*const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const fs = require("fs");
const { cloudinaryApiKey, cloudinaryApiSecret, cloudinaryCloudName } = require("../config/keys");
const generateCode = require("../utils/generateCode");

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudinaryCloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
  secure: true,
});


const uploadFileToCloudinary = async ({ file, ext }) => {
  const publicId = `${generateCode(12)}_${Date.now()}`;

  try {
    let result;

    const uploadOptions = {
      public_id: publicId,
      folder: "uploads",
      resource_type: "auto",
      type: "private", // <--- make it private
    };

    if (file.path) {
      result = await cloudinary.uploader.upload(file.path, uploadOptions);
      fs.unlinkSync(file.path);
    } else if (file.buffer) {
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    } else {
      throw new Error("No valid file data found for upload");
    }

    // Return the file’s unique ID, not public URL
    return result.public_id;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
};

const getPrivateFileUrl = (publicId) => {
  const url = cloudinary.url(publicId, {
    type: "private",
    resource_type: "image",
    sign_url: true, // <--- signed for access
  });
  return url;
};

module.exports = { uploadFileToCloudinary, getPrivateFileUrl };




*/



















const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const fs = require("fs");
const { cloudinaryApiKey, cloudinaryApiSecret, cloudinaryCloudName } = require("../config/keys");
const generateCode = require("../utils/generateCode");

// Cloudinary configuration
cloudinary.config({
  cloud_name: cloudinaryCloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
});


const uploadFileToCloudinary = async ({ file, ext }) => {
  const publicId = `${generateCode(12)}_${Date.now()}`;

  try {
    let result;

    if (file.path) {
      // If file was saved to disk
      result = await cloudinary.uploader.upload(file.path, {
        public_id: publicId,
        folder: "uploads",
        resource_type: "auto",
      });

      // Delete the temporary file from local storage
      fs.unlinkSync(file.path);
    } else if (file.buffer) {
      // If file is stored in memory (no path)
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            folder: "uploads",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    } else {
      throw new Error("No valid file data found for upload");
    }

    // Return Cloudinary URL
    return result.secure_url;

  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
};

const getPrivateFileUrl = (publicId) => {
  const expiresAt = Math.floor(Date.now() / 1000) + 60; // 60 seconds
  const url = cloudinary.url(publicId, {
    resource_type: "image",
    type: "authenticated", // signed access only
    sign_url: true,
    expires_at: expiresAt,
  });
  return url;
};

module.exports = { uploadFileToCloudinary, getPrivateFileUrl };

