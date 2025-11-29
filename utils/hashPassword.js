const bcrypt = require('bcryptjs');

//Why you can’t call next(error) here next(error) is specific to Express middleware. It requires:function(req, res, next) { ... } hashPassword has no req, res, next. There’s no request being handled yet, just some asynchronous code running inside a controller. It’s just a function, not an Express route or middleware. So you can’t call next(error) here. Instead, you use the standard JavaScript way of reporting errors in asynchronous code: reject(error). The controller that called hashPassword can then catch that error and pass it to next(error) there.

const hashPassword = (password)=>{
    return new Promise((resolve, reject)=>{
        bcrypt.genSalt(12, (error, salt)=>{
            if(error){
                return reject(error);
            }
            bcrypt.hash(password, salt, (error, hash)=>{
                if(error){
                    return reject(error);
                }
                resolve(hash);
            });
        });
    });
};

module.exports = hashPassword;