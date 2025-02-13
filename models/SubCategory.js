const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    subCategoryName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',  
        required: true
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });


const SubCategory = mongoose.model('SubCategory', subCategorySchema);

module.exports = SubCategory;
