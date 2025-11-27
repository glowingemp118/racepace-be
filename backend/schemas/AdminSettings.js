const mongoose = require('mongoose');



const AdminSettings = new mongoose.Schema({
    faq: mongoose.Schema.Types.Mixed,
    tac: String,
    privacy: String,
    about: String
}, {
    timestamps: true,
})

module.exports = mongoose.model('admin_settings', AdminSettings);