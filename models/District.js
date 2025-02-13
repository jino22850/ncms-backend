const mongoose = require('mongoose');


const districtSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });


const District = mongoose.model('District', districtSchema);

module.exports = District;
