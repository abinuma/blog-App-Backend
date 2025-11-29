const path=require("path")
const {File}=require("../models")
const cloudinary = require("../config/cloudinary");//added
const {uploadToCloudinary,getSignedUrl}=require("../utils/cloudinary") //getSignedUrl is added
const generateCode=require("../utils/generateCode") //added
const {validateExtension} = require("../validators/file");
const { type } = require("os"); //added

const uploadFile = async (req, res, next) => {
  try {
    const { file } = req;
    if (!file) throw new Error("File not selected");

    const ext = path.extname(file.originalname);
    const isValid = validateExtension(ext);
    if (!isValid) throw new Error("Only jpg, jpeg, png allowed");

    const code = generateCode(12);
    const finalname = `${code}_${Date.now()}`;//${ext}

    const result = await uploadToCloudinary(req.file.buffer, finalname, {
      folder: "uploads",
    });

    const newFile = new File({
      filename: file.originalname,
      public_id: result.public_id,
      format: result.format,
      size: file.size,
      mimetype: file.mimetype,
      createdBy: req.user._id,
    });
    await newFile.save();

    res.status(201).json({
      code: 201,
      status: true,
      message: "File uploaded successfully",
      data: {
        public_id: newFile.public_id,
        _id: newFile._id,
      },
    });
  } catch (error) {
    next(error);
  }
};
const getFile = async (req, res, next) => {
  try {
    const { key } = req.query; /** You can name it anything (key, fileId, id, banana 🍌 if you want 😄),
but it must match between:

what you destructure in req.query

and what you send in Postman (or from frontend) */
    if (!key) throw new Error("Missing file key");

    const fileDoc = await File.findOne({ public_id: key });
    if (!fileDoc) throw new Error("File not found in database");

    const signedUrl = getSignedUrl(key, 60); // valid 60 seconds

    res.status(200).json({
      code: 200,
      status: true,
      message: "Get signed URL successfully",
      data: { url: signedUrl },
    });
  } catch (error) {
    next(error);
  }
};


const deleteFile = async (req, res, next) => {
  try {
    const { publicId } = req.query; // pass in route param
    if (!publicId) {
      res.code = 400;
      throw new Error("Missing file reference");
    }

    const result = await cloudinary.uploader.destroy(publicId,{
      invalidate:true,
      resource_type:"image"
    });

    if (result.result !== "ok") {
      res.code = 400;
      throw new Error("Failed to delete file");
    }
    await File.findOneAndDelete({public_id:publicId})

    res.status(200).json({
      code: 200,
      status: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports={uploadFile,getFile,deleteFile}







//my own upload file


// const uploadFile = async (req, res, next) => {
//   try {
//     const { file } = req;
//     if (!file) {
//       res.code = 400;
//       throw new Error("File is not selected");
//     }

//     const ext = path.extname(file.originalname);
//     const isValidExt = validateExtension(ext);

//     if (!isValidExt) {
//       res.code = 400;
//       throw new Error("Only .jpg or .jpeg or .png format is allowed");
//     }

//     const key = await uploadToCloudinary({ file, ext });

//     if(key){
//       const newFile = new File({
//         key,
//         size: file.size,
//         mimetype: file.mimetype,
//         createdBy: req.user._id
//       });
//       await newFile.save();
//     }

//     res
//       .status(201)
//       .json({
//         code: 201,
//         status: true,
//         message: "File uploaded successfully",
//         data: { key },
//       });
//   } catch (error) {
//     next(error);
//   }
// };



//upload file of chatgpt


// const uploadFile = async (req, res, next) => {
//   try {
//     const { file } = req;
//     if (!file) {
//       return res.status(400).json({ message: "File is not selected" });
//     }

//     const ext = path.extname(file.originalname);
//     const isValidExt = validateExtension(ext);

//     if (!isValidExt) {
//       return res.status(400).json({ message: "Only .jpg, .jpeg, .png allowed" });
//     }

//     // ✅ Pass the Buffer and file name
//     const key = await uploadToCloudinary(file.buffer, file.originalname);

//     if (key) {
//       const newFile = new File({
//         public_id: key.public_id,  // store public_id, not key object
//         filename: file.originalname,
//         format: key.format,
//         size: file.size,
//         mimetype: file.mimetype,
//         createdBy: req.user._id
//       });
//       await newFile.save();
//     }

//     res.status(201).json({
//       code: 201,
//       status: true,
//       message: "File uploaded successfully",
//       data: key,
//     });
//   } catch (error) {
//     next(error);
//   }
// };





// const uploadFile=async(req,res,next)=>{
//     try{
//         const {file}=req
//         if(!file){
//             res.code=400
//             throw new Error("file not selected")
//         }
//         const ext=path.extname(file.originalname)
//         const isValid=validateExtension(ext)
//         if(!isValid){
//             res.code=400
//             throw new Error("only jpg or jpeg or png format is allowed")
//         }
        
//         const code = generateCode(12);
//         const finalname = `${code}_${Date.now()}`;
//          const result = await uploadToCloudinary(req.file.buffer,finalname, {
//            folder: "uploads"
//          });
//         //  const newFile= new File({
//         //     filename:file.originalname,
//         //     // url:result.secure_url,
//         //     public_id:result.public_id,
//         //     format:result.format,
//         //     size:file.size,
//         //     uploadedBy:req.user._id
//         //  })

//         const newFile= new File({
//             filename:file.originalname,
//             // url:result.secure_url,
//             public_id:result.public_id,
//             format:result.format,
//             size:file.size,
//             uploadedBy:req.user._id
//          })

//          await newFile.save()

//           res.status(201).json({
//             code:201,
//             status:true,
//             message:"File uploaded successfully",
//             data:{public_id: newFile.public_id,
//               _id:newFile._id
//             }
//           });
        
//     }catch(error){
//         next(error)
//     }
// }


// const getFile = async (req, res, next) => {
//   try {
//     const { publicId } = req.query; // file reference stored in DB
//     if (!publicId) {
//       res.code = 400;
//       throw new Error("Missing file reference");
//     }
//     const fileDoc = await File.findOne({ public_id: publicId });
//     if (!fileDoc) {
//       res.code = 404;
//       throw new Error("File not found in database");
//     }

//     const signedUrl = getSignedUrl(publicId, 3600); // 1 hour valid
//     res.status(200).json({
//       code: 200,
//       status: true,
//       url: signedUrl,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
