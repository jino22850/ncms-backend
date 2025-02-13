const mongoose = require('mongoose');


const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',  
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
