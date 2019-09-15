let mongoose = require('mongoose');

// User Schema

const studentSchema = mongoose.Schema({
    userID:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    contact:{
        type:Number,
        required:true
    },
    packs:{
        type:Array,
        required:true,
        unique:true
    },
    tests:{
        type:Array,
        required:false,
        unique:false
    }
});

let Student = module.exports = mongoose.model('Student',studentSchema);
