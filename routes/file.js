const express = require("express");
const multer = require("multer");
const isAuth = require("../middlewares/isAuth");
const { fileController } = require("../controllers");
const upload = require("../middlewares/upload");
const path = require("path");

const router = express.Router();

router.post(
  "/upload",
  isAuth,
  upload.single("image"),
  fileController.uploadFile,
);
router.get("/signed-url",isAuth,fileController.getFile)

router.delete("/delete",isAuth,fileController.deleteFile)

module.exports = router;
