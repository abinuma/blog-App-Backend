const { check } = require("express-validator");
const validateEmail = require("./validateEmail");
const mongoose = require("mongoose");

/*

   when we use .withMessage then the message inside it is saved in msg property of error object; that object found in validationResult(req).errors in return this validationResult(req) is found in express-validator library. the check() function works as:eg. check("email").isEmail().withMessage("Please enter a valid email") ; This means:“Look at the field called email in the request body — make sure it’s a valid email address.If not, show the message: ‘Please enter a valid email.’”
  check("email")
  you’re telling express-validator:

  “I want to validate the field named email — find it wherever it exists in the request.”
  By default, check() looks for that field in all common locations:
  req.body
  req.params
  req.query
  req.cookies
  req.headers
  So it automatically checks anywhere that key might appear.

   express-validator does not immediately send anything.
Instead, it attaches the validation result to the req object internally.
Specifically, it keeps a list of errors in a hidden property inside the request, so subsequent middleware can access it.
How validate.js accesses them? see on validators/validate.js
signupValidator just collects errors.
validate.js reads them and sends the HTTP response.


Even though your signupValidator array doesn’t visibly contain any next() calls, each check() you wrote (like check("name")...) actually creates an internal middleware function that Express runs under the hood.🧩 What check("name") really returns? When you do this:check("name").notEmpty().withMessage("Name is required"): …it doesn’t immediately validate anything.
It returns something like this (conceptually):
function middleware(req, res, next) {
  // 1️⃣ Look at req.body.name
  // 2️⃣ If it's empty, store an error internally
  // 3️⃣ Move to the next middleware
  next();
}
So each check() call produces one of these middleware functions.
🧠 What happens when Express runs the route

When you define your route like this:

router.post("/signup", signupValidator, validate, authController.signup);
Express sees signupValidator as an array of middleware functions, so it executes them one after another automatically.
The flow is:
Express runs the first validator → it checks the field → calls next().
Express runs the second validator → same process → calls next().
Express runs the third validator → same process → calls next().
Finally, Express moves to your validate middleware.
🧩 Then your validate middleware runs
Your own code checks whether express-validator collected any errors.When no errors → it calls next() in this line of code: (if(Object.keys(errors.errors).length ===0){next();}) to continue to authController.signup.
*/

const signupValidator = [
  check("name").notEmpty().withMessage("Name is required"),
  check("email")
    .isEmail()
    .withMessage("Invalid email")
    .notEmpty()
    .withMessage("Email is required"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password should be 6 char long")
    .notEmpty()
    .withMessage("Password is required"),
];

const signinValidator = [
  check("email")
    .isEmail()
    .withMessage("Invalid email")
    .notEmpty()
    .withMessage("Email is required"),
  check("password").notEmpty().withMessage("Password is required"),
];

const emailValidator = [
  check("email")
    .isEmail()
    .withMessage("Invalid email")
    .notEmpty()
    .withMessage("Email is required"),
];

const verifyUserValidator = [
  check("email")
    .isEmail()
    .withMessage("Invalid email")
    .notEmpty()
    .withMessage("Email is required"),
  check("code").notEmpty().withMessage("Code is required"),
];

const recoverPasswordValidator = [
  check("email")
    .isEmail()
    .withMessage("Invalid email")
    .notEmpty()
    .withMessage("Email is required"),

  check("code").notEmpty().withMessage("Code is required"),

  check("password")
    .isLength({ min: 6 })
    .withMessage("Password should be 6 char long")
    .notEmpty()
    .withMessage("Password is required"),
];

const changePasswordValidator = [
  check("oldPassword").notEmpty().withMessage("Old password is required"),
  check("newPassword").notEmpty().withMessage("New password is required"),
];

const updateProfileValidator = [
  check("email").custom(async(email)=>{
    if(email){
      const isValidEmail = validateEmail(email);
      if(!isValidEmail){
        throw "Invalid email";
      }
    }
  }),
  check("profilePic").custom(async (profilePic) =>{
    if(profilePic && !mongoose.Types.ObjectId.isValid(profilePic)){
      throw "Invalid profile picture";
    }
  })
]

module.exports = {
  signupValidator,
  signinValidator,
  emailValidator,
  verifyUserValidator,
  recoverPasswordValidator,
  changePasswordValidator,
  updateProfileValidator
};
