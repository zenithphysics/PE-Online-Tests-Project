var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var adminSchema = new Schema({
    "adminID":{
        unique:true,
        type:String,
        required:true
 
    },
    "password":{
        type:String,
        required:true
    }
})



module.exports = mongoose.model('Admin',adminSchema)