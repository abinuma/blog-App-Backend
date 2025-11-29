const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (buffer, fileName, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      ...options,
      public_id: fileName, // set custom file name
    };
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};
const getSignedUrl = (publicId, expiresIn = 3600) => {
  const url = cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
  });
  return url;
};
const deleteFromCloud=(publicId)=>{
  try{

  }catch(error){
    next(error)
  }
}

module.exports = {uploadToCloudinary,getSignedUrl,deleteFromCloud};
