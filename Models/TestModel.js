let mongoose = require('mongoose');

// User Schema

const testSchema = mongoose.Schema({
  test_type:{
      type:String,
      required:true
  },
  test_name:{
      type: String,
      required:true
  },
  domain:{
      type:String,
      required:true
  },
  chapter:{
      type:String,
      required:true
  },
  topic:{
    type:String,
    required:false
  },
  test_taken_count:{
      type:Number,
      required:false
  },
 /*subject_details:[
    // no of questions in subject 1
    // difficulty level 1 questions in subject 1
    // 
  ],
  section_details:[

],
chapter_details:[

],
topic_details:[

  ], */
  DLevel1_details:[
    no_of_DL1_Questions:{
        type:Number
    },
    no_of_DL1_corrects={      
        type:Array
    },
    no_of_DL1_unattempted={
        type:Array
    },
    no_of_DL1_wrong={
        type:Array
    },
    allTime_percentage_DL1_corrects:{
        type:Number  //  (sum of no_of_DL1_corrects) * 100 / ( ( no_of_DL1_questions) *  ( test_taken_no ) ) 
    }
],
DLevel2_details:[
],
DLevel3_details:[

],
/*
correct_questions_details:[

],
unattempted_questions_details:[

],
wrong_questions_details:[

] ,*/
  questions:[
      {
        subject:{
            type:String,
            required:false
        },
        chapter:{
            type:String,
            required:false
        },
        topic:{
            type:String,
            required:false
        },
        section:{
            type:String,
            required:false
        },
        difficulty_level:{
            type:String,
            required:false
        }
      }
  ],
  answer_key:[
      {
          type:String,
          required:false
      }
  ],
  answer_images:[
      {
          type:Buffer,
          required:false
      }
  ],
  answer_videos:[
      {
          type:String,
          required:false
      }
  ]
});

let Student = module.exports = mongoose.model('Student',studentSchema);
