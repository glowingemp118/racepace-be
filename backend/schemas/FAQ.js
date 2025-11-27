const mongoose = require('mongoose');

const FAQScheema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a text value'],
    },
    message: {
        type: String,
        required: [true, 'Please add a text value'],
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "users"
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model("faq", FAQScheema)