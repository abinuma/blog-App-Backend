const mongoose = require("mongoose");

//The schema defines structure (no DB access),Blueprint for structure & validation;knows what a user looks like,but doesn’t know how to save, find, update, or delete users.The model provides the database connection and CRUD operations.Mongoose object built from schema.
// "user" is the actual users collection in the actual db but "User" is the model name we use in our code to interact with that collection.
//const User = mongoose.model("User", userSchema);Mongoose:Creates a model named "User".Automatically maps it to a MongoDB collection named users (lowercase + pluralized form of "User").So:"User" (Model) → connected internally → "users" (collection in MongoDB)

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    //role: 1 -> super admin, role> 2 -> normal admin, role 3  user
    role: { type: Number, default: 3 },
    verificationCode: String,
    forgotPasswordCode: String,
    isVerified: { type: Boolean, default: false },
    profilePic: { type: mongoose.Types.ObjectId, ref: "file" },
  },
  { timestamps: true }
);
const User = mongoose.model("user", userSchema);
module.exports = User;
