// models/Client.js

const mongoose = require("mongoose");

const atheleteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  age: {
    type: String,
    required: [true, "Age is required"],
  },
  team: {
    type: String,
    required: [true, "Team is required"],
  },

}, { timestamps: true });

const Athelete = mongoose.model("Athlete", atheleteSchema);

module.exports = Athelete;

