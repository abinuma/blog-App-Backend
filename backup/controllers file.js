const path = require("path"); //
const { validateExtension } = require("../validators/file");//
const { uploadFileToCloudinary } = require("../utils/cloudinary");//
const {File} = require("../models"); //
const { get } = require("http");
// const { uploadFileToCloudinary, getPrivateFileUrl } = require("../utils/cloudinary");


const uploadFile = async (req, res, next) => {
  try {
    const { file } = req;
    if (!file) {
      res.code = 400;
      throw new Error("File is not selected");
    }

    const ext = path.extname(file.originalname);
    const isValidExt = validateExtension(ext);

    if (!isValidExt) {
      res.code = 400;
      throw new Error("Only .jpg or .jpeg or .png format is allowed");
    }

    const key = await uploadFileToCloudinary({ file, ext });

    if(key){
      const newFile = new File({
        key,
        size: file.size,
        mimetype: file.mimetype,
        createdBy: req.user._id
      });
      await newFile.save();
    }

    res
      .status(201)
      .json({
        code: 201,
        status: true,
        message: "File uploaded successfully",
        data: { key },
      });
  } catch (error) {
    next(error);
  }
};





/*
// Generate signed URL for private file access

const getSignedUrl = async (req, res, next) => {
  try {
    let { key } = req.query;
    if (!key) throw new Error("Missing file key");

    // If key is a full Cloudinary URL, extract public_id
    if (key.startsWith("http")) {
      const parts = key.split("/upload/");
      if (parts.length < 2) throw new Error("Invalid Cloudinary URL");
      key = parts[1].replace(/\.[a-zA-Z0-9]+(\?.*)?$/, ""); // remove file extension and query params
    }

    // Clean the key
key = key.trim(); // removes spaces/newlines at start or end

// If full URL, extract public_id
if (key.startsWith("http")) {
  const parts = key.split("/upload/");
  if (parts.length < 2) throw new Error("Invalid Cloudinary URL");
  key = parts[1].replace(/\.[a-zA-Z0-9]+(\?.*)?$/, ""); // remove extension and query params
  key = key.trim(); // remove any leftover whitespace
}


    const url = getPrivateFileUrl(key);

    res.status(200).json({
      code: 200,
      status: true,
      message: "Signed URL generated successfully",
      data: { url },
    });
  } catch (error) {
    next(error);
  }
};

*/

module.exports = {uploadFile,
};