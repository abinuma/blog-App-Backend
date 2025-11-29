const {
  PORT,
  CONNECTION_URL,
  JWT_SECRET,
  SENDER_EMAIL,
  EMAIL_PASSWORD,

  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} = process.env;

module.exports = {
  port: PORT,
  connectionUrl: CONNECTION_URL,
  jwtSecret: JWT_SECRET,
  senderEmail: SENDER_EMAIL,
  emailPassword: EMAIL_PASSWORD,

  cloudinaryApiKey: CLOUDINARY_API_KEY,
  cloudinaryApiSecret: CLOUDINARY_API_SECRET,
  cloudinaryCloudName: CLOUDINARY_CLOUD_NAME,
};
