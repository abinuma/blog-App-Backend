/* This file is for unexpected internal errors — problems in your code, database, or logic, not user mistakes(like invalid email,password..). 
    Database connection errors
    Throwing an exception (throw new Error("User not found"))
    Syntax or runtime errors in route handlers
    Network or server issues*/
//Notice it has four parameters, not three — that’s how Express knows it’s an error handler.
const errorHandler = (error, req, res, next) => {
  const code = res.code ? res.code : 500;

  res
    .status(code)
    .json({ code, status: false, message: error.message, stack: error.stack });
};
module.exports = errorHandler;
