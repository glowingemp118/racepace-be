/**
 * Sample schema
 *  @author glowingemp101
 */
const mongoose = require("mongoose");

const ContactSupportSchema = new mongoose.Schema(
    {
        name: String,
        email: String,
        subject: String,
        message: String,
        reply: String,
        phone:String,
        status:{
            type: String,
            enum: ["pending", "responded"],
            default: "pending",
        }
    },
    {
        timestamps: true,
    }
);

// Model
module.exports = mongoose.model("contactSupport", ContactSupportSchema);