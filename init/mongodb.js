const mongoose =require('mongoose');
const { connectionUrl } = require('../config/keys');

//errorHandler.js handles runtime errors inside Express.
//It only handles errors inside the request–response cycle (when an API endpoint runs). connectMongodb() runs once at startup(as ordered in app.js: "const app = express()" then "connectMongodb()"), before Express starts listening for requests.No HTTP request exists yet, so errorHandler.js cannot be triggered. errorHandler.js is an Express middleware, which means it only runs when: app.use(errorHandler) which is found at the last line of app.js before module.exports = app; and a request is being processed.It relies on req, res, and the middleware chain.next(error) passes the error along the chain.Without a request, there’s no req/res and no chain. Because errorHandler.js expects a request–response cycle: const errorHandler = (error, req, res, next) => { res.status(...).json({ ... });}; . If connectMongodb() fails before any request, req and res don’t exist.Calling next(error) is meaningless — there’s no middleware chain active yet.So startup errors must be handled locally



const connectMongodb = async ()=>{
    try {
        await mongoose.connect(connectionUrl);
        console.log('Mongodb connection successful');
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = connectMongodb;