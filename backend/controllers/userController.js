const asyncHandler = require("express-async-handler");
const {
  successResponse,
  SuccessWithoutBody,
  PrintError,
  verifyrequiredparams,
} = require("../middleware/common");
const User = require("../schemas/User");
const Devices = require("../schemas/Devices");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getProfile } = require("../helpers/UserHelper");
const { getUsers } = require("../helpers/dbHelper");
const { types } = require("../middleware/accessMiddleware");
const { otpMail } = require("../helpers/mailHelper");

// @desc  Register new user
// @route  auth/signup
// @method  post
// @access  public
const dftvls = {};

const registerUser = asyncHandler(async (req, res) => {
  try {
    let { email, user_type } = req.body;
    email = email.toLowerCase();
    await verifyrequiredparams(
      400,
      req.body,
      ["email", "password", "name", "user_type"],
      res
    );

    if (user_type == types.admin) {
      throw new Error("Incorrect user type");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if email is in correct format
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    const user = await createUser({
      userData: { ...req.body },
    });
    await otpMail({
      email,
      subject: "Account Verification",
      otp: user.reset_code,
    });
    successResponse(
      201,
      `Signup successfully`,
      {
        ...user,
      },
      res
    );
  } catch (error) {
    return PrintError(400, error.message, res);
  }
});

const createUser = async ({ userData }) => {
  try {
    let { name, email, password, image, user_type } = userData;
    email = email.toLowerCase();
    const userExists = await User.findOne({ email });

    if (userExists && userExists.is_verified) {
      throw new Error("User already exists with that email");
    }
    if (password.length < 6) {
      throw new Error("Password too short, min 6 chacters required");
    }
    // hash password or encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);
    const reset_code = generateCode(6);
    // create user
    let user = null;
    if (userExists && !userExists.is_verified) {
      user = await User.findByIdAndUpdate(
        userExists._id,
        { ...userData, reset_code },
        { new: true }
      );
    } else {
      user = await User.create({
        ...userData,
        email,
        password: hashedpassword,
        user_type,
        name,
        image,
        reset_code,
      });
      await handleDeviceRegistration({
        user_id: user._id,
        device_id: userData?.device_id,
        device_type: userData?.device_type,
      });
    }
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

// @desc  Login
// @route  auth/login
// @method  post
// @access  public

const loginUser = asyncHandler(async (req, res) => {
  try {
    await verifyrequiredparams(400, req.body, ["email", "password"], res);
    const userData = req.body;
    let { email, password, user_type } = req.body;
    let emaile = email.toLowerCase();
    if (password.length < 6) {
      throw new Error("Password too short, min 6 chacters required");
    }
    let profile = {};
    const user = await User.findOne({ email: emaile });
    if (!user) {
      throw new Error("Incorrect Email/Password Combinition");
    }
    // const checkUserType = user.user_type == user_type;
    // if (!checkUserType) {
    //   throw new Error("Incorrect user type");
    // }
    const checkActive = user.is_verified;
    if (!checkActive) {
      return PrintError(403, "User is not active", res);
    }
    if (user && (await bcrypt.compare(password, user.password))) {
      await handleDeviceRegistration({
        user_id: user._id,
        device_id: userData?.device_id,
        device_type: userData?.device_type,
      });
      profile = await getProfile(user._id);
      const accesstoken = generateToken(user._id, profile.name, emaile);
      successResponse(
        200,
        "Loggedin Successfully",
        { ...profile, accesstoken },
        res
      );
    } else {
      throw new Error("Incorrect Email/Password Combinition");
    }
  } catch (error) {
    return PrintError(400, error.message, res);
  }
});

const social_login = asyncHandler(async (req, res) => {
  try {
    await verifyrequiredparams(
      400,
      req.body,
      ["social_id", "social_type"],
      res
    );

    let {
      social_id,
      social_type,
      email,
      device_id,
      device_type,
      user_type = types.user,
      name,
    } = req.body;
    email = email?.toLowerCase();
    let user = await User.findOne({ social_id });
    user && user_type == user.user_type;
    // Fallback to find by email if social_id not found
    if (!user && email) {
      user = await User.findOne({ email });
      if (user && !user.social_id) {
        user_type = user.user_type;
        await User.updateOne(
          { _id: user._id },
          { $set: { social_id, social_type } }
        );
      }
    }

    // Create new user if none found
    if (!user) {
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser && existingEmailUser.user_type !== user_type) {
        return PrintError(
          400,
          "An account with this email already exists with a different user type.",
          res
        );
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("123456", salt);

      user = await User.create({
        name: name || "User",
        email,
        social_id,
        social_type,
        user_type,
        password: hashedPassword,
        is_verified: true, // ✅ assume verified for social signup
      });
    }

    // Check if user is allowed to log in
    if (user.status !== "active") {
      return PrintError(
        400,
        "Your account is not active. Please contact support.",
        res
      );
    }

    // Register device always
    await handleDeviceRegistration({
      user_id: user._id,
      device_id,
      device_type,
    });

    const { password, ...profile } = await getProfile(user._id);

    const accesstoken = generateToken(
      profile._id,
      profile.name,
      profile.email,
      user_type
    );

    return successResponse(
      200,
      "Login successful.",
      { ...profile, ...dftvls, accesstoken },
      res
    );
  } catch (error) {
    return PrintError(
      400,
      error.message || "An unexpected error occurred.",
      res
    );
  }
});

const handleDeviceRegistration = async ({
  user_id,
  device_id,
  device_type,
}) => {
  if (device_id && device_type) {
    if (
      device_type.toLowerCase() != "android" &&
      device_type.toLowerCase() != "ios"
    ) {
      // throw error if device is not android or ios
      throw new Error('"Device type not supported"');
    } else {
      const user_devices = await Devices.findOne({
        device_id: device_id,
        user_id: user_id,
      });
      if (!user_devices) {
        await Devices.create({
          device_id: device_id,
          device_type: device_type,
          user_id: user_id,
        });
      }
    }
  }
};

const generateToken = (id, name, email, user_type) => {
  return jwt.sign({ id, name, email, user_type }, process.env.JWT_SECRET);
};

const generateCode = () => Math.floor(Math.random() * 111111) + 100000;

// @desc  change password
// @route  auth/changepassword
// @method  post
// @access  public
const changePassword = asyncHandler(async (req, response) => {
  try {
    const user_id = req.user._id;
    const { old_password, new_password, confirm_password } = req.body;
    await verifyrequiredparams(
      400,
      req.body,
      ["old_password", "new_password", "confirm_password"],
      response
    );
    // get profile here
    const userdata = await User.findById(user_id);
    // if user not found throw error
    if (!userdata) {
      throw new Error("User Not Found");
    }

    const verified_user = await User.findOne({
      _id: user_id,
      is_verified: true,
    });
    if (!verified_user) {
      throw new Error("User is not verified");
    }

    // field check for new password and confrim password
    if (new_password != confirm_password) {
      throw new Error("Fields doesn't match");
    }
    // password lenght check
    if (new_password?.length < 6) {
      throw new Error("password cannot be less than 6 characters");
    }
    // generate new password
    const hashedPass = await bcrypt.hash(new_password, 8);
    // generate new password
    const verifypassword = await bcrypt.compare(
      old_password,
      userdata.password
    );
    if (!verifypassword) {
      throw new Error("Incorrect old password");
    } else {
       await User.updateOne(
        { _id: user_id },
        { $set: { password: hashedPass, is_verified: true } }
      );
      return SuccessWithoutBody(200, "Pasword Updated Successfully", response);
    }
  } catch (err) {
    return await PrintError(400, err.message, response);
  }
});

/*
  |----------------------------------------------------------------------
  | FUNCTION @logout on the serverless.yml route 
  |----------------------------------------------------------------------
*/

const logout = asyncHandler(async (req, response) => {
  try {
    const { device_id } = req.body;
    const user_id = req.user._id;
    await Devices.deleteOne({ user_id: user_id, device_id: device_id });
    return SuccessWithoutBody(200, "Logged Out Successfully", response);
  } catch (err) {
    return PrintError(400, err.message, response);
  }
});

/*
  |----------------------------------------------------------------------
  | FUNCTION @forgotpassword on the serverless.yml route 
  |----------------------------------------------------------------------
*/

const forgotpassword = asyncHandler(async (req, response) => {
  try {
    const { email } = req.body;
    // generate random reset code
    // const resetcode = (Math.floor(Math.random() * 10) + 1);
    const reset_code = generateCode();
    // find user by email
    let emaile = email.toLowerCase();
    const user = await User.findOne({ email: emaile });
    // if user not found throw error
    if (!user) {
      throw new Error("Invalid user or user not found");
    } else {
      const updateuser = await User.updateOne(
        { _id: user._id },
        { $set: { reset_code: reset_code } }
      );
      await otpMail({
        email: emaile,
        subject: "Account Verification",
        otp: reset_code,
      });
      return successResponse(
        200,
        "Email Sent Successfully",
        { code: reset_code },
        response
      );
    }
    // if user  found call forgot password function
    // the response would be { code:1234}
    // email is not being sent for now as there is no email provider
  } catch (err) {
    console.log(err);
    return PrintError(400, err.message, response);
  }
});

const validatepin = asyncHandler(async (req, response) => {
  try {
    // get body from user and add to body constant
    await verifyrequiredparams(400, req.body, ["email", "pin"], response);
    const { email, pin, forgot_verify } = req.body;
    let emaile = email?.toLowerCase();
    // find user by email from body
    const user = await User.findOne({ email: emaile });
    // if user not found throw error else add user object to user1
    if (!user) {
      throw new Error("User not found");
    }
    // check pin from db and match it with user entered pin
    if (pin != user.reset_code && user.reset_code != 0) {
      throw new Error("Code doesnt match");
    }
    // check if user have requested for reset code or not
    if (user.reset_code == 0) {
      throw new Error("Forget Password Request not found");
    }
    if (user.reset_code == pin) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            is_verified: true,
            reset_code: "",
            forgot_verify,
            is_deleted: false,
          },
        }
      );
      let profile = await getProfile(user._id);
      let accesstoken = generateToken(user._id, profile.name, emaile);
      return successResponse(
        200,
        "Pin Verified Successfully",
        { ...profile, accesstoken },
        response
      );
    }
  } catch (err) {
    return PrintError(400, err.message, response);
  }
});

/*
  |----------------------------------------------------------------------
  | FUNCTION @reset password on the serverless.yml route 
  |----------------------------------------------------------------------
*/

const resetpassword = asyncHandler(async (req, response) => {
  try {
    const { email, newpassword, retypenewpassword } = req.body;

    let emaile = email.toLowerCase();
    // find user by email
    const user = await User.findOne({ email: emaile });
    if (!user) {
      throw new Error("user not found");
    }
    if (!user.is_verified || !user.forgot_verify) {
      throw new Error("User is not verified");
    }
    // check if both password fields match
    if (newpassword !== retypenewpassword) {
      throw new Error("Fields doesnt match");
    }
    // check if password is less than 8 characters
    if (newpassword.length < 6) {
      throw new Error("Password Cannot be less than 6 characters");
    }
    // bcrypt is a library included for password encryption
    // generate encrypted password from user input
    const hashedPass = await bcrypt.hash(newpassword, 6);
    // update user password
     await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPass, is_verified: true } }
    );
    return SuccessWithoutBody(200, "Pasword reset Successfully", response);
  } catch (err) {
    return PrintError(400, err.message, response);
  }
});
const getUserProfile = asyncHandler(async (req, response) => {
  try {
    const user_id = req.user._id;
    const user = await getProfile(user_id);
    if (!user) {
      throw new Error("user not found");
    }
    return successResponse(200, "Fetched Successfully", user, response);
  } catch (err) {
    return PrintError(400, err.message, response);
  }
});
const updateUserProfile = asyncHandler(async (req, response) => {
  try {
    const user_id = req.user._id;
    const user = await User.findOne({ _id: user_id });
    if (!user) {
      throw new Error("user not found");
    }
    const updateUser = await User.findOneAndUpdate(
      { _id: user._id },
      { ...req.body },
      { new: true }
    );
    const newObject = await getProfile(user._id);
    return successResponse(200, "Get User Sucessfully", newObject, response);
  } catch (err) {
    return PrintError(400, err.message, response);
  }
});
const updateUser = asyncHandler(async (req, response) => {
  try {
    const user_id = req.params.id;
    const user = await User.findOne({ _id: user_id });
    if (!user) {
      throw new Error("user not found");
    }
    const updateUser = await User.findOneAndUpdate(
      { _id: user._id },
      { ...req.body },
      { new: true }
    );
    const newObject = updateUser.toObject();
    delete newObject.password;
    return successResponse(200, "update user sucessfully", newObject, response);
  } catch (err) {
    return PrintError(400, err.message, response);
  }
});
const updateTimeZone = asyncHandler(async (req, response) => {
  try {
    const user_id = req.user._id;
    const { timezone } = req.body;
    // find user by email
    const user = await User.findOne({ _id: user_id });
    if (!user) {
      throw new Error("user not found");
    }
    await User.updateOne({ _id: user_id }, { $set: { timezone: timezone } });
    return SuccessWithoutBody(200, "Timezone Updated Sucessfully", response);
  } catch (err) {
    return PrintError(400, err.message, response);
  }
});
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user_id = req.user._id;
    const user = await User.findOne({ _id: user_id });
    if (!user) {
      throw new Error("user not found");
    }
    await User.updateOne({ _id: user._id }, { $set: { is_deleted: true } });
    return successResponse(200, "Delete User Account Successfully", {}, res);
  } catch (err) {
    return PrintError(400, err.message, res);
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    let { search, limit, pageno, status, user_type } = req.query;
    const filter = {};
    status && (filter.status = status);
    user_type && (filter.user_type = parseInt(user_type) || types.user);
    const users = await getUsers({ search, limit, pageno, filter });
    return successResponse(200, "Fetched Successfully !", users, res);
  } catch (err) {
    return PrintError(400, err.message, res);
  }
});

const getUserById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      throw new Error("user not found");
    }
    const object = user?.toObject();
    const img = object.image;
    object.image = `${process.env.IMAGEBASEURLLOCAL}${img}`;
    delete object.password;
    return successResponse(200, "Fetched successfully", object, res);
  } catch (err) {
    return PrintError(400, err.message, res);
  }
});

const guest_login = asyncHandler(async (req, res) => {
  try {
    const user_type = types.guest;

    // Check if guest user already exists for this device
    let user = await User.findOne({
      user_type,
    });

    // If not found, create a guest user
    if (!user) {
      user = await User.create({
        name: "Guest",
        email: "guest@gmail.com",
        user_type,
        password: "123456",
        is_verified: true,
      });
    }

    // Generate access token
    const { password, ...profile } = await getProfile(user._id);
    const accesstoken = generateToken(
      profile._id,
      profile.name,
      profile.email,
      user_type
    );

    return successResponse(
      200,
      "Login successful.",
      { ...profile, ...dftvls, is_guest: true, accesstoken },
      res
    );
  } catch (error) {
    return PrintError(400, error.message, res);
  }
});

module.exports = {
  registerUser,
  loginUser,
  changePassword,
  logout,
  forgotpassword,
  validatepin,
  resetpassword,
  updateTimeZone,
  getUserProfile,
  updateUserProfile,
  createUser,
  generateCode,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
  social_login,
  guest_login,
};
