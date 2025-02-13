const mongoose = require('mongoose');


const coverageSchema = new mongoose.Schema({
    correspondent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Correspondent', 
        required: true
    },
    coverageNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    receivedDate: {
        type: Date,
        required: true
    },
    telecastDate: {
        type: Date,
        required: true
    },
    Category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', 
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
        trim: true
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        trim: true
    },
    channel:{
        type:String,
        enum:['rupavahini', 'eye'],
        required: true,
        default:'search'
    },
    medium:{
        type:String,
        enum:['Search','Sinhala', 'Tamil','English'],
        required: true,
        default:'search'
    },
    

    telecastType: {
        type: String,
        enum: ['With Voice', 'Without Voice', 'Not Telecast',null],
        default: null,
   
    }
}, { timestamps: true });


const Coverage = mongoose.model('Coverage', coverageSchema);

module.exports = Coverage;
