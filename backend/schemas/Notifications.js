const mongoose = require('mongoose');


const NotificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    type: String,
    object: {
        type: mongoose.Schema.Types.Mixed,
    },
    title: String,
    message: String,
    status: Number,
    color: String,
}, {
    timestamps: true,
})

module.exports = mongoose.model('notifications', NotificationSchema);  