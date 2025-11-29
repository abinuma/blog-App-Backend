const {validationResult} = require("express-validator");


/*

validate.js runs before your route controller executes — it stops bad data from reaching your logic.
2️⃣ How validate.js accesses them.(contents that express-validator attaches the validation result to the req object internally.)?answer : validationResult(req) looks at the internal storage on req created by all the check() calls.

It returns an object containing all errors, with information about each error's location and message.like   { msg: "Invalid email", path: "email", location: "body" },

Where does it get sent?

In validate.js:

res.status(400).json(mappedErrors);


The res object is the response object of the current HTTP request.

Express automatically knows this res belongs to the same request that hit your route.

So the error goes directly back to the client (browser, Postman, frontend app, etc.) — it doesn’t “send to a file” or another JS file.

signupValidator just collects errors.

validate.js reads them and sends the HTTP response.

Object is a built-in JavaScript global.

It provides static methods like Object.keys(), Object.values(), Object.entries().

Here, we use Object.keys() to get all the keys of an object.

keys is a method of Object:

Object.keys(someObject)

It returns an array of all enumerable property names (keys) of the object.
Example:
const person = { name: "Alice", age: 25 };
console.log(Object.keys(person)); // ["name", "age"]
errors(the first one) → the object from validationResult(req)

errors.errors → the array of error objects

Object.keys(errors.errors) → returns an array of array indices (["0", "1", ...]) and is a property inside the validationResult object.
if we change     const errors = validationResult(req);
to const err= validationResult(req);
err → the object returned by validationResult(req)
    err = {
    errors: [
        { msg: "Name is required", path: "name", location: "body" },
        { msg: "Invalid email", path: "email", location: "body" }
    ],
    isEmpty: [Function],
    array: [Function]
    }

    err.errors → the array of error objects.
      Each object has:
        msg → error message
        path → field name
        location → body/query/paths
        if err = {
    errors: [
        { msg: "Name is required", path: "name", location: "body" },
        { msg: "Invalid email", path: "email", location: "body" }
    ],
    isEmpty: [Function],
    array: [Function]
                }
        err.errors = [
        { msg: "Name is required", path: "name", location: "body" },
        { msg: "Invalid email", path: "email", location: "body" }
        ]
    Object.keys() expects an object argument.
    Here, we pass err.errors (an array) to Object.keys().Every object in JavaScript is a collection of properties, which are key-value pairs:const person = { name: "Alice", age: 25 };name and age are property names (keys)."Alice" and 25 are the values.Arrays in JavaScript are also objects.Array indices "0" and "1" are actually property names of the array object.so our array err.errors is also an object with property names "0" and "1" (the indices of the array elements). and values are the actual error objects: "{ msg: "Name is required", path: "name" }" and "{ msg: "Invalid email", path: "email" }"

    notice that in javascript arrays the indices are keys of the array objects and the actual elements of the array are the values of those keys.
    
    Object.keys(err.errors) → returns an array of the indices of the array: ["0", "1", ...].
    Object.keys(err.errors).length === 0 → true if no errors, false if there are validation errors.

    mappedErrors is a simplified, frontend-friendly version of the full validation errors — it does not contain every property of the original objects. we transform the array into a key-value object where:Key = field name (name, email, password)Value = the validation message. the .map() iterates through the array of err.errors and creates a new array of objects with only the relevant properties.            mappedErrors[error.path] = error.msg; is valid JavaScript syntax for assigning a key-value pair to an object.here error.path is the field name (like "email") and error.msg is the corresponding validation message (like "Invalid email").So if there are multiple errors for the same field, the last one will overwrite previous ones in mappedErrors.so in the first iteration error={ msg: "Name is required", path: "name", location: "body" } and then error.path is "name" and error.msg is "Name is required".So mappedErrors becomes: { name: "Name is required" }
*/
const validate = (req, res, next)=>{
    const errors = validationResult(req);
    const mappedErrors = {};
    if(Object.keys(errors.errors).length ===0){
        next();
    }else{
        errors.errors.map((error)=>{
            mappedErrors[error.path] = error.msg;
        })
        res.status(400).json(mappedErrors);
    }
}

module.exports =validate;