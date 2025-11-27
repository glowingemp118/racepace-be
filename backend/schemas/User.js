const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
    },
    user_type: {
      type: Number,
      required: true,
    },
    social_id: String,
    social_type: String,
    phone: {
      type: String,
    },
    image: {
      type: String,
      default: "noimg.png",
    },
    coverImage: {
      type: String,
      default: "noimg.png",
    },
    reset_code: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
    location: {
      lat: Number,
      lng: Number,
      address: String,
    },
    forgot_verify: {
      type: Boolean,
      default: false,
    },
    plan: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
    credits: {
      type: Number,
      default: 20,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("users", UserSchema);

module.exports = User;
