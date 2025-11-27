const types = {
    admin: 0,
    coach: 1,
    parent: 2,
    user: 3,
    guest: 4,
};
// Custom middleware to check user access based on user_type
const grantAccess = (allowedUserTypes) => {
    return (req, res, next) => {
        const user = req.user;
        // Assuming req.user contains user information including user_type
        if (!user || !allowedUserTypes.includes(user.user_type)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        next(); // If user is authorized, continue to next middleware or route handler
    };
};
const adminAccess = (req, res, next) => {
    const user = req.user;
    // Assuming req.user contains user information including user_type
    if (!user || user.user_type !== types.admin) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    } else {
        next(); // If user is authorized, continue to next middleware or route handler
    }

};
module.exports = { grantAccess, types, adminAccess }