const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    laps: {
        type: mongoose.Schema.Types.Array,
        required: true
    },
    type: {
        type: String,
        enum: ['live_race', 'split_calculator'],
        default: 'live_race',
    },
    athlete: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Athlete',
        required: true,
    },
    eventName: {
        type: String,
    },
    raceDistance: {
        type: Number,
        required: [true, "Race distance is required"],
        // min: 100,
    },
    splitInterval: {
        type: Number,
        required: [true, "Split interval is required"],
        // min: 100,
    },
    finishTime: {
        type: String,
        required: [true, "Finish time is required"],
    },
    raceStrategy: {
        type: String,
        enum: ['Adrenaline Start', 'Negative Splits', 'Even Laps'],
        default: 'Adrenaline Start',
    }

}, { timestamps: true });

const Log = mongoose.model('Log', logSchema);

module.exports = Log;