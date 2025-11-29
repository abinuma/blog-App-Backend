const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true }, // original 
    // Cloudinary 
    public_id: { type: String, required: true }, // 
    format: { type: String }, // File format (jpg, png, etc.)
    size: { type: Number }, // File size in bytes
    mimetype: { type: String }, // MIME type
    createdBy: { type: mongoose.Types.ObjectId, ref: "user" }, // uploader
  },
  { timestamps: true }
);

const File = mongoose.model("file", fileSchema);

module.exports = File;
