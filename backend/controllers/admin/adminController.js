const asyncHandler = require("express-async-handler");
const User = require("../../schemas/User");
const { PrintError, successResponse } = require("../../middleware/common");
const { types } = require("../../middleware/accessMiddleware");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyrequiredparams } = require("../../middleware/common");

const adminApproved = asyncHandler(async (req, response) => {
  try {
    const user_id = req.params.id;
    const user = await User.findOne({ _id: user_id });
    if (!user) {
      throw new Error('user not found')
    }
    const updateUser = await User.findOneAndUpdate({ _id: user._id }, { is_verified: true }, { new: true });
    if (!updateUser) {
      throw new Error('Failed to update user');
    }
    return successResponse(200, 'Updated Successfully', updateUser, response);
  } catch (err) {
    return PrintError(400, err.message, response);
  }
});

const createAdmin = async ({ userData }) => {
  try {
    const { email, password, user_type, name } = userData;

    if (user_type !== types.admin) {
      throw new Error("User Type must be Admin");
    }

    let emaile = email.toLowerCase();
    const userExists = await User.findOne({ email: emaile });

    if (userExists) {
      throw new Error("User already exists with that email");
    }
    if (password.length < 6) {
      throw new Error("Password too short, min 6 chacters required");
    }
    // hash password or encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);
    // create user
    const user = await User.create({
      email: emaile,
      password: hashedpassword,
      user_type,
      is_verified: true,
      name,
    });
    if (user) {
      let profile = user?.toJSON();
      delete profile.password;
      return profile;
    } else {
      throw new Error("Something Went Wrong while creating user");
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const registerAdmin = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    await verifyrequiredparams(
      400,
      req.body,
      ["email", "password", "name"],
      res
    );

    const user = await createAdmin({ userData: { ...req.body, user_type: 0 } });

    const accesstoken = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
    );

    successResponse(
      201,
      `Signup successfully`,
      {
        ...user,
        accesstoken,
      },
      res
    );
  } catch (error) {
    return PrintError(400, error.message, res);
  }
});
const adminLogin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase(), user_type: types.admin });

    if (!user) {
      throw new Error("Admin not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const accesstoken = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
    );

    successResponse(
      200,
      "Login successful",
      {
        _id: user._id,
        email: user.email,
        name: user.name,
        user_type: user.user_type,
        accesstoken,
      },
      res
    );
  } catch (error) {
    return PrintError(400, error.message, res);
  }
});

module.exports = { adminApproved, registerAdmin, adminLogin }