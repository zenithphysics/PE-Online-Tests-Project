let mongoose = require('mongoose');

// User Schema
var Schema = mongoose.Schema;
const resultSchema = new Schema({
   test_name:{
       type:String,
       unique:false,
       required:false
   },
   test_type:{
       type:String,
       required:false,
       unique:false
   },
   time_taken:{
       type:String,
       required:false,
       unique:false
   },
   taken_on:{
       type:String,
       required:false,
       unique:false
   },
   studentID:{
       type:String,
       required:false,
       unique:false
   },
   test_subject:{
       type:String,
       required:false,
       unique:false
   },
   test_domain:{
       type:String,
       required:false,
       unique:false
   },
   test_chapter:{
       type:String,
       required:false,
       unique:false
   },
   total_marks:{
       type:Number,
       required:false,
       unique:false
   },
   test_correct_marks:{
       type:Number,
       requied:false,
       unique:false
   },
   answers:{
       type:Array,
       required:false
   }
});

module.exports = mongoose.model('Result',resultSchema);