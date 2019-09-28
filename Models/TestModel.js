let mongoose = require('mongoose');

// User Schema

const testSchema = mongoose.Schema({
   test_name:{
        type: String,
        required:true,
        unique:true
   },
   duration:{
       type:Number,
       required:false
   },
  test_type:{
        type:String,
        required:true
  },
  domain:{
        type:String,
        required:true
  },
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
  test_taken_count:{
      type:Number,
      required:false,
      default:0
  },
  correct_marks:{
      type:Number,
      required:false,
      default:4
  },
  wrong_marks:{
      type:Number,
      required:false,
      default:-1
  },
  questions:[
    {
      subject:{
          type:String,
          required:false
      },
      section:{
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
      DLevel:{
          type:String,
          required:false
      }
   
    }
], 
answer_key:{
 type:Array,
 required:false  
},
question_images_white:[
  {
      type:Buffer,
      required:false
  }
],
question_images_black:[
    {
        type:Buffer,
        required:false
    }
],
answer_images_white:[
      {
          type:Buffer,
          required:false
      }
],
answer_images_black:[
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
  ],
  // ********************************* STATISTICS RELATED ATTRIBUTES *****************************************/
  question_details:   // For Question wise  stats
      {
          questions_stats:[{
            total_correct:{
                type:Number,
                required:false,
                default:0
            },
            total_unattempted:{
                type:Number,
                required:false,
                default:0
            },
            total_wrong:{
                type:Number,
                required:false,
                default:0
            }
          }]
    },
  subject_details:  // For Subject Wise Stats
      {
          subjects:{        //Array of Distinct Subjects
              type:Array,
              required:false
          },
          subjects_question_count:{  // No. of questions in test belonging to distinct subjects
              type:Array,
              required:false
          },
          subjects_stats:[ // Stats of each Subject
            {
                total_correct:{
                    type:Number,
                    required:false,
                    default:0
                },
                total_unattempted:{
                    type:Number,
                    required:false,
                    default:0
                },
                total_wrong:{
                    type:Number,
                    required:false,
                    default:0
                }
            }
            ]       
      }
 ,
  section_details: // Section Wise Stats
    {
        sections:{        //Array of Distinct Sections
            type:Array,
            required:false
        },
        sections_question_count:{  // No. of questions in test belonging to distinct sections
            type:Array,
            required:false
        },
        sections_stats:[ // Stats of each sections
          {
              total_correct:{
                  type:Number,
                  required:false,
                  default:0
              },
              total_unattempted:{
                  type:Number,
                  required:false,
                  default:0
              },
              total_wrong:{
                  type:Number,
                  required:false,
                  default:0
              }
          }
          ]       
    }
,
chapter_details: // Chapter Wise Stats
    {
        chapters:{        //Array of Distinct Chapters
            type:Array,
            required:false
        },
        chapters_question_count:{  // No. of questions in test belonging to distinct chapters
            type:Array,
            required:false
        },
        chapters_stats:[ // Stats of each chapters
          {
              total_correct:{
                  type:Number,
                  required:false,
                  default:0
              },
              total_unattempted:{
                  type:Number,
                  required:false,
                  default:0
              },
              total_wrong:{
                  type:Number,
                  required:false,
                  default:0
              }
          }
          ]       
    }
,
topic_details: // Topic Wise Stats
    {
        topics:{        //Array of Distinct topics
            type:Array,
            required:false
        },
        topics_question_count:{  // No. of questions in test belonging to distinct topics
            type:Array,
            required:false
        },
        topics_stats:[ // Stats of each topics
          {
              total_correct:{
                  type:Number,
                  required:false,
                  default:0
              },
              total_unattempted:{
                  type:Number,
                  required:false,
                  default:0
              },
              total_wrong:{
                  type:Number,
                  required:false,
                  default:0
              }
          }
          ]       
    }
,
taken_by:{
    type:Array,
},
DLevel_details:{
    DLevel1_count:{ // No. of questions in DLevel 1
        type:Number,
        required:false
    },
    DLevel2_count:{  // No. of Questions in DLevel 2
        type:Number,
        required:false
    },
    DLevel3_count:{  // No. of Questions in DLevel 3
        type:Number,
        required:false
    },
    DLevel_stats:[ // Stats of each sections
        {
            total_correct:{
                type:Number,
                required:false,
                default:0
            },
            total_unattempted:{
                type:Number,
                required:false,
                default:0
            },
            total_wrong:{
                type:Number,
                required:false,
                default:0
            }
        }
        ] 
}
});

let Test = module.exports = mongoose.model('Test',testSchema);
