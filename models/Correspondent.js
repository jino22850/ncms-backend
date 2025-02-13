const mongoose = require('mongoose');

const correspondentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
      },
      CorId: { 
        type: String, 
        required: true, 
        unique: true 
      },
      initials: { 
        type: String, 
        required: true 
      },
      email: {
        type: String,
        required: true,
        unique: true
      },
      district:{
        type:String,
        required:true,
      },
      NIC:{
        type: String,
        required:true,
        unique:true
      },
      address: {
        type: String,
        required: true,
      },
      mobileNumber:{
        type:String,
        required:true,
      }
      
     
    }, { timestamps: true });

    module.exports = mongoose.model('Correspondent', correspondentSchema);
