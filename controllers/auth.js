const { User, File } = require("../models");
const hashPassword = require("../utils/hashPassword");
const comparePassword = require("../utils/comparePassword");
const generateToken = require("../utils/generateToken");
const generateCode = require("../utils/generateCode");
const sendEmail = require("../utils/sendEmail");
const { compare } = require("bcryptjs");

/* When a middleware finishes successfully, it calls: next() to move on to the next middleware in the chain
If something goes wrong, it can call: next(error) and that tells Express:“Stop the normal flow and jump to the first error-handling middleware.” then Express recognizes an error-handling middleware if it has this (error, req, res, next) exact signature: Notice it has four parameters, not three — that’s how Express knows it’s an error handler. next()	Pass control to the next middleware but	next(error)	Skip all normal middleware and jump to the error handler

//⚙️ The controller doesn’t handle the error — it reports it. Notice that the controller never sends a response directly when something fails.Instead, it uses:throw new Error("Something"); so when we use throw new Error, try catch it is checking a business rule:“Does this email already exist in the database?”If yes → it throws an error because it’s a logical conflict, not a syntax problem.That error is then passed to errorHandler.js via next(error):  the next(error):	Skip all normal middleware and jump to the error handler. This passes the error to your global errorHandler.js, which is responsible for sending a consistent error response to the client.So the controller creates the error,and the error handler formats and sends it. Why set res.code inside the controller?This is just a way to attach an HTTP status code to the error object,since Error objects themselves don’t have a status.

your signupValidator + validate.js already catch most input errors (like missing name, invalid email, or too-short password).
So you might wonder — what “can go wrong” after that, inside the controller?
Let’s break that down carefully 👇
💥 Things that can still go wrong after validation
Validation checks only what the client sends — not what can fail inside your server logic or database.
Your controller deals with runtime (eg. if DB fails, if bcrypt fails,if MongoDB connection lost. These errors are not visible until the program executes those lines. so runtime means During program execution. check("email").isEmail() is not a runtime failure — it’s a validation failure (bad data from client). The program still runs fine; it just decides not to continue because the user’s input didn’t pass the rules. so the signupValidator and validate.js do'nt deal with rutime errors.) or logical errors that are outside the validator’s scope.

signupValidator + validate.js = Input gatekeepers 🚧
→ Make sure the client sends correct, complete, valid data.
→ These errors are user mistakes.
authController.signup = Backend executor ⚙️
→ Deals with what happens when your app actually tries to do something with that data (like saving to DB, sending an email, hashing a password).
→ These errors are business or internal logic errors.

validate.js → directly responds to client with validation messages (e.g. “Email is required”).
authController.signup → forwards runtime errors to errorHandler.js via next(error).
Validation errors are expected → no need to go to the global error handler.
Runtime errors are unexpected → should go to errorHandler.js for consistent handling/logging.
*/

const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      res.code = 400;
      throw new Error("Email already exists");
    }
    const hashedPassword = await hashPassword(password);
    const newUser = new User({ name, email, password: hashedPassword, role });

    await newUser.save();
    res.status(201).json({
      code: 201,
      status: true,
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.code = 401;
      throw new Error("Invalid credentials");
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      res.code = 401;
      throw new Error("Invalid credentials");
    }

    user.password = undefined; //to not send password in response

    const token = generateToken(user);

    res.status(200).json({
      code: 200,
      status: true,
      message: "User signed in successfully",
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
};

const verifyCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    //why do we use User with capital here but user with small letter below?
    //     //Because User is a model (like a class) and user is an instance of that model (like an object). so why dont we use the same name for both?//We use different names to distinguish between the model and its instances. The model (User) defines the structure and behavior of the data, while instances (user) represent actual records in the database.so we use User with capital to do database operations like finding, creating, or updating users. and we use user with small letter to work with specific user data once we have retrieved it from the database.
    const user = await User.findOne({ email });
    if (!user) {
      res.code = 404;
      throw new Error("User not found");
    }

    //user.isVerified === true is same as user.isVerified
    if (user.isVerified) {
      res.code = 400;
      throw new Error("User already verified");
    }

    const code = generateCode(6);
    user.verificationCode = code;
    await user.save();

    //send email

    await sendEmail({
      emailTo: user.email,
      subject: "Email verification code",
      code,
      content: "verify your account",
    });

    res.status(200).json({
      code: 200,
      status: true,
      message: "User verification code sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.code = 404;
      throw new Error("User not found");
    }
    if (user.verificationCode !== code) {
      res.code = 400;
      throw new Error("Invalid verification code");
    }
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();
    res.status(200).json({
      code: 200,
      status: true,
      message: "User verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

const forgotPasswordCode = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.code = 404;
      throw new Error("User not found");
    }
    const code = generateCode(6);
    user.forgotPasswordCode = code;
    await user.save();

    //send email
    await sendEmail({
      emailTo: user.email,
      subject: "Forgot Password Code",
      code,
      content: "change your password",
    });
    res.status(200).json({
      code: 200,
      status: true,
      message: "Forgot password code sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

const recoverPassword = async (req, res, next) => {
  try {
    const { email, code, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.code = 404;
      throw new Error("User not found");
    }
    if (user.forgotPasswordCode !== code) {
      res.code = 400;
      throw new Error("Invalid code");
    }
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.forgotPasswordCode = null;
    await user.save();
    res.status(200).json({
      code: 200,
      status: true,
      message: "Password recovered successfully",
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { _id } = req.user;

    const user = await User.findById(_id);
    if (!user) {
      res.code = 404;
      throw new Error("User not found");
    }

    const match = await comparePassword(oldPassword, user.password);
    if (!match) {
      res.code = 400;
      throw new Error("old password doesn't match");
    }
    if (oldPassword === newPassword) {
      res.code = 400;
      throw new Error("you are providing old password");
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      code: 200,
      status: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { name, email, profilePic } = req.body;

    const user = await User.findById(_id).select(
      "-password -verificationCode -forgotPasswordCode"
    );
    if (!user) {
      res.code = 404;
      throw new Error("User not found");
    }
    if (email) {
      const isUserExist = await User.findOne({ email });
      if (
        isUserExist &&
        isUserExist.email === email &&
        String(user._id) !== String(isUserExist._id)
      ) {
        res.code = 400;
        throw new Error("Email already exists");
      }
    }

    if (profilePic) {
      const file = await File.findById(profilePic);
      if (!file) {
        res.code = 404;
        throw new Error("file not found");
      }
    }

    user.name = name ? name : user.name;
    user.email = email ? email : user.email;
    user.profilePic = profilePic;

    if (email) {
      user.isVerified = false;
    }
    await user.save();

    res.status(200).json({
      code: 200,
      status: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

//this route is protetcted so we can get user id from req.user.protected means isAuth middleware is used before this controller. so the term "protected" means that only authenticated users can access this route. The isAuth middleware checks for a valid authentication token and attaches the user information to the req object if the token is valid.
const currentUser = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id)
      .select("-password -verificationCode -forgotPasswordCode")
      .populate("profilePic");
    if (!user) {
      res.code = 404;
      throw new Error("User not found");
    }
    res.status(200).json({
      code: 200,
      status: true,
      message: "Get current user successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  signin,
  verifyCode,
  verifyUser,
  forgotPasswordCode,
  recoverPassword,
  changePassword,
  updateProfile,
  currentUser,
};
