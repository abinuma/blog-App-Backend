const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
dotenv.config();
const connectMongodb = require("./init/mongodb");
const { authRoute, categoryRoute, fileRoute, postRoute } = require("./routes");
const { errorHandler } = require("./middlewares");
const notfound = require("./controllers/notfound");

//analogy to understand how app.js and index.js work together. Inside app.js you:
// 🧱 Build the restaurant (create the Express app)
// 👨‍🍳 Hire chefs (controllers)
// 🍔 Write the menu (routes like /signup, /signin)
// 🚪 Set house rules (middlewares)
// 🧹 Train staff how to handle problems (errorHandler)
// 📞 Connect to suppliers (MongoDB)
// Now you go to index.js.Here, you open the restaurant to the public: This is like:
// 🔑 Unlocking the door
// 💡 Turning on the lights
// 📢 Putting the “Open” sign outside
// 🧍 Welcoming customers (requests).Now, when a “customer” (like Postman or frontend) sends a request to http://localhost:8000/api/v1/auth/signup,it’s like a customer walking into your restaurant and placing an order.That request goes to your kitchen (app.js),where the chefs (controllers) prepare the food (response)and send it back to the customer 🍱.

//init app

const app = express();

//connect database
connectMongodb();

//third-party middleware
/**Browsers implement a security rule called the Same-Origin Policy:
A web page running on one origin (protocol + domain + port) cannot make requests to a different origin unless that origin explicitly allows it.Example:
Your React frontend: http://localhost:5173
Your backend: http://localhost:8000
Different port = different origin, so a request is blocked by default.
CORS is the mechanism that allows your backend to say:
“I allow requests from these specific origins.” CORS is a browser security feature.
It only matters in the browser. Requests from Postman, Node.js backend, or server-to-server calls don’t need CORS.
You must configure CORS correctly during development if your frontend and backend run on different origins. 
app.use(cors(...)) → applies the middleware to all routes.
origin: [...] → allows requests from multiple origins:
"http://localhost:5173" → your React frontend
"http://127.0.0.1:5173" → sometimes used instead of localhost
The middleware automatically sets headers like:
Express passes the request to the cors() middleware.
cors() checks the Origin header sent by the browser (e.g., http://localhost:5173).
If the origin matches one of the allowed origins, it adds CORS headers to the response:
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization*/
app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"]}));
app.use(express.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
app.use(morgan("dev"));

//route section
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/file", fileRoute);
app.use("/api/v1/posts", postRoute);

//not found route
app.use(notfound);

//error handling middleware
app.use(errorHandler);

module.exports = app;

/* after validate.js flow goes to authController.signup using the next() that is found in validate.js "if(Object.keys(errors.errors).length ===0){
        next();
    }" but first  how do the flow go from signupValidator in validators to validate.jssince sinupValidator is not middleware? answer: because in the route we have written signupValidator, validate, authController.signup so when a request comes to /signup first signupValidator runs then validate.js runs then authController.signup runs. and signupValidator just collects errors.validate.js reads them and sends the HTTP response. if no error it calls next() that is found in validate.js "if(Object.keys(errors.errors).length ===0){
        next();
    }" so the flow goes to authController.signup so if it gose naturally from signupValidator to validate.js to authController.signup then why do we need next() in validate.js? answer: because if we do not use next() in validate.js then the flow will stop in validate.js and will not go to authController.signup.so we need next() in validate.js to go to authController.signup. and if there is an error in signupValidator then the flow will stop in validate.js and will not go to authController.signup because in validate.js we are sending the response if there is an error.so next() is used to go to the next middleware or controller if there is no error. but we dont usse next() in signupValidator because it is not a middleware it is just a collection of validators.so next() is used in validate.js to go to the next middleware or controller if there is no error. and if there is an error in signupValidator then the flow will stop in validate.js and will not go to authController.signup because in validate.js we are sending the response if there is an error. so the flow signupValidator, validate, authController.signup is like a chain of middleware and controllers that are executed in order when a request comes to /signup. first signupValidator runs then validate.js runs then authController.signup runs. and signupValidator just collects errors.validate.js reads them and sends the HTTP response. if no error it calls next() that is found in validate.js "if(Object.keys(errors.errors).length ===0){
        next();
    } so becaus signupValidator is normal function not middleware the flow goes naturally. is it must to use next() in validate.js? can the flow go naturally as it did in signupValidator? answer: no it is not must to use next() in validate.js but if we do not use next() in validate.js then the flow will stop in validate.js and will not go to authController.signup.so we need next() in validate.js to go to authController.signup. and if there is an error in signupValidator then the flow will stop in validate.js and will not go to authController.signup because in validate.js we are sending the response if there is an error.so next() is used to go to the next middleware or controller if there is no error. but we dont usse next() in signupValidator because it is not a middleware it is just a collection of validators.so next() is used in validate.js to go to the next middleware or controller if there is no error. and if there is an error in signupValidator then the flow will stop in validate.js and will not go to authController.signup because in validate.js we are sending the response if there is an error. so the flow signupValidator, validate, authController.signup is like a chain of middleware and controllers that are executed in order when a request comes to /signup. first signupValidator runs then validate.js runs then authController.signup runs. and signupValidator just collects errors.validate.js reads them and sends the HTTP response. if no error it calls next() that is found in validate.js "if(Object.keys(errors.errors).length ===0){
        next();
    } so becaus signupValidator is normal function not middleware the flow goes naturally. is it must to use next() in validate.js? can the flow go naturally as it did in signupValidator? answer: no it is not must to use next() in validate.js but if we do not use next() in validate.js then the flow will stop in validate.js and will not go to authController.signup.so we need next() in validate.js to go to authController.signup. and if there is an error in signupValidator then the flow will stop in validate.js and will not go to authController.signup because in validate.js we are sending the response if there is an error.so next() is used to go to the next middleware or controller if there is no error. but we dont usse next() in signupValidator because it is not a middleware it is just a collection of validators.so next() is used in validate.js to go to the next middleware or controller if there is

    */