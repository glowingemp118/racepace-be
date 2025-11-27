const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../schemas/User');
const { types } = require('./accessMiddleware');
// const { PrintError } = require('./common');

const protect = asyncHandler(async (req, res, next) => {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // get token from header
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            //get user from the token 
            req.user = await User.findById(decoded.id, { password: 0 })
            if (!req.user) {
                // throw new Error("User not found")
                res.status(401).json({ status: 401, message: "User not found" });
                return false;
            }
            if(req.originalUrl.includes('/admin') && req.user.user_type !== types.admin) {
                // throw new Error("Unauthorized Access")
                res.status(401).json({ status: 401, message: "Unauthorized Access" });
                return false;
            }
            next()
        } catch (error) {
            // console.log(error)
            // throw new Error(error.message);
            res.status(401).json({ status: 401, message: error.message });
            return false;
        }
    }
    else {
        // throw new Error("Bearer Token missing");
        res.status(401).json({ status: 403, message: "Bearer Token missing" });
        return false;
        // PrintError(403, "Bearer Token missing", res)
    }
})

module.exports = {
    protect
}