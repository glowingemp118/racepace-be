const { types } = require('../middleware/accessMiddleware');
const User = require('../schemas/User');



const getCode = async () => {
    return Math.floor(1000 + Math.random() * 9000)
}

const getProfile = async (user_id) => {
    try {
        const user = await User.findById(user_id)
        if (!user || user?.status !== 'active') {
            throw new Error('User not found or inactive');
        } else {
            const userProfile = { ...user._doc };
            if (userProfile.image) {
                userProfile.image = `${process.env.IMAGEBASEURLAWS}${userProfile.image}`;
            }
             if (userProfile.coverImage) {
                userProfile.coverImage = `${process.env.IMAGEBASEURLAWS}${userProfile.coverImage}`;
            }
            userProfile.role = Object.keys(types).find(key => types[key] === userProfile.user_type);
            delete userProfile.password;
            delete userProfile.reset_code;
            return userProfile;
        }
    } catch (error) {
        throw new Error(error.message);
    }
}


module.exports = { getCode,getProfile }