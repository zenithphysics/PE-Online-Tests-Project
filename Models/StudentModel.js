let mongoose = require('mongoose');

// User Schema
var Schema = mongoose.Schema;
const studentSchema = new Schema({
    studentID:{
        type:String,
        unique:true,
        required:true
    },
    name:{
        type:String,
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
    packs:[{
        type:String,
        required:true
    }],
    tests:{
        type:Schema.Types.Mixed,
        required:false,
        unique:false
    }
});

module.exports = mongoose.model('Student',studentSchema);
