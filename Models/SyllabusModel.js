var mongoose = require('mongoose')
var Schema = mongoose.Schema

var SyllabusSchema = new Schema({
    "Domains":{
        type:Array,
        "Subjects":{
            type:Array,
        "Chapters":{
            type:Array,
            "topics":{
                type:Array
            }
        },
        "Sections":{
            type:Array
        }
    }


    }
})

module.exports = mongoose.model('Syllabus',SyllabusSchema)