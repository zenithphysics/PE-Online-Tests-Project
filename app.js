// <Modules>
const express = require('express')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
var bodyParser = require('body-parser')
const hash = require('hash.js')
const path = require('path')
const cors = require('cors')
const multer = require('multer');
const atob = require('atob')
// </Modules>

// <Database>
var config = require('./config/database')
mongoose.connect(config.database)
// </Database>

// <MongooseModels>
var Syllabus = require('./Models/syllabusModel');
var Admin = require('./Models/AdminModel');
var Student = require('./Models/StudentModel');
var Test = require('./Models/TestModel')
// </Mongoose Models>

// <Initialzations>
var app = express();
var port = 8085;
app.use(cors())
const upload = multer();
app.use(express.static(path.join(__dirname+"/public"))) // Set A Public Folder
app.use(bodyParser.urlencoded({limit: "1000mb", extended: true, parameterLimit:1000000}))
app.use(bodyParser.json({limit: "1000mb"}))
app.use(upload.array('uploadedFiles'))

// </Initialization>

// <ServerConfig>
app.listen(port,()=>{
    console.log('\x1b[32m%s\x1b[1m', '[PE-Tests-Server] - Server Has Been Started On Port - '+port);  //cyan
})
// </ServerConfig>

//////////////////////////////////////// API CALLS ////////////////////////////////////////////////////////

app.get('/',(req,res)=>{
    res.redirect("./Student/index.html");
})
app.get('/admin',(req,res)=>{
    res.redirect("./Admin/index.html");
})

// Verification Calls (Common to almost all APIS)
 
    // Verify If Token Exists 
    function verifyToken(req,res,next)
    {
    // Get The Auth Header value
    const bearerToken = req.headers['authorization'];
    // Check if bearer is undefined
    if(typeof(bearerToken)!== 'undefined')
    {
    console.log('\x1b[32m%s\x1b[1m',"[verifyToken] - Token Exists");

    // Get Token from array
    console.log('\x1b[32m%s\x1b[1m',"[verifyToken] - "+bearerToken) 
    req.token = bearerToken;
    req.data = req.body;
    next();
    }
    else
    {
    // Forbidden
    console.log('\x1b[31m%s\x1b[1m',"[verifyToken] - Token does not exist"); 
    res.json({is_verified:false});
    }
    }

    // Verify Admin Token
    app.get("/verifyAdmin",verifyToken ,(req,res)=>{
        console.log("[/verifyAdmin] - Verifying Admin")
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/verifyAdmin] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/verifyAdmin] - Admin Verification Successful');  
                res.json({is_verified:true,admin:authData.admin})
            }
        })
    })

    app.get("/verifyStudent",verifyToken ,(req,res)=>{
        console.log("[/verifyStudent - Verifying Student")
        jwt.verify(req.token,'pe-tests-student',(err,authData)=>{
            console.log(authData)
            if(err){
                console.log(authData)
                console.log('\x1b[31m%s\x1b[1m', '[/verifyStudent] - Student Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/verifyStudent] - Student Verification Successful');  
                console.log(`Student is ${authData.studentID}`)
                var student = JSON.parse(JSON.stringify(authData));
                Student.findById(student._id,((err,student)=>{
                    if(err || student==null)
                    {
                        console.log('\x1b[31m%s\x1b[1m', '[/verifyStudent] - Student Verification Failed');  
                        console.log(err)
                        res.json({is_verified:true,is_successful:false})

                    }
                    else
                    {
                        res.json({is_verified:true,student:student,is_successful:true})
                    }
                }))
            }
        })
    })


// Admin Related API Calls

        // Create Admin
        app.post('/createAdmin',verifyToken,(req,res)=>{
            jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
                if(err){
                    console.log('\x1b[31m%s\x1b[1m', '[/createAdmin] - Admin Verification Failed');  
                    console.log(err);
                    res.json({is_verified:false})
                }
                else
                {
                    console.log('\x1b[32m%s\x1b[1m', '[/createAdmin] - Admin Verification Successful');  
                    var hashed_password = hash.sha256().update(req.body.password).digest('hex')
                    console.log(req.body.adminID);
                    console.log(req.body.password);
                    var admin = new Admin({"adminID":req.body.adminID,"password":hashed_password})
                    console.log('\x1b[33m%s\x1b[1m', '[/createAdmin] - Creating an Admin...'); //yellow log
                    console.log(req.body);
                    admin.save((err,admin)=>{
                        if(err){
                            console.log('\x1b[31m%s\x1b[1m', '[/createAdmin] - Error Occured While Creating Admin');  //red log
                            console.log(err)
                            res.json({"is_verified":true,"is_successful":false});
                        }
                        else
                        {
                            console.log('\x1b[32m%s\x1b[1m', `[/createAdmin] - Admin ${admin.adminID} created successfully.'`); // green log
                            res.json({"is_verified":true,"is_successful":true});
        
                        }
                    })
                }
            })
           
            })
        ///////////////////////////////////

        
        // Admin Login
        app.post('/loginAdmin',(req,res)=>{
                var adminID = req.body.adminID;
                var password = hash.sha256().update(req.body.password).digest('hex')
                console.log('\x1b[33m%s\x1b[1m', '[/loginAdmin] - Verifying Admin...'); //yellow log
                Admin.findOne({$and:[{"adminID":adminID},{"password":password}]},(err,admin)=>{
                    if(err || !admin){
                        console.log('\x1b[31m%s\x1b[1m', '[/loginAdmin] - Admin Does not exist.');  //red log
                        console.log(err)
                        res.json({logged_in:false})
                    }
                    else{
                        console.log('\x1b[32m%s\x1b[1m',"[/loginAdmin - Admin Verified"); // green log
                        console.log('\x1b[33m%s\x1b[1m',"[/loginAdmin - Generating Token...."); // yellow log
                        jwt.sign({"admin":admin},"pe-tests-admin",(err,token)=>{
                            if(err){
                                console.log('\x1b[31m%s\x1b[1m',"[/loginAdmin] - Error Generating Admin Token:"); //red log
                                console.log(err)
                                res.json({logged_in:false})
                            }
                            else {
                                console.log('\x1b[32m%s\x1b[1m',"[/loginAdmin] - Admin Token Generated"); // green log
                                res.json({"admin_token":token,"admin":admin,logged_in:true});
                            }
                        })
                    }
                })
        })
        ///////////////////////////////////

        // Fetch Admins
        app.get('/getAdmins',verifyToken,(req,res)=>{
            jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
                if(err){
                    console.log('\x1b[31m%s\x1b[1m', '[/getAdmins] - Admin Verification Failed');  
                    console.log(err);
                    res.json({is_verified:false})
                }
                else
                {
                    console.log('\x1b[32m%s\x1b[1m', '[/getAdmins] - Admin Verification Successful');  
                    var admins = Admin.find({},(err,admins)=>{
                        if(err || !admins)
                        {
                            console.log('\x1b[31m%s\x1b[1m', '[/getAdmins] - Failed to get admins'); 
                            console.log(err); 
                            res.json({is_verified:true,is_successful:false})

                        }
                        else
                        {
                            console.log('\x1b[32m%s\x1b[1m', '[/getAdmins] - Admins Fetched Successful'); 
                            console.log(admins) 
                            res.json({is_verified:true,is_successful:true,admins:admins})
                        }
                    })
                }

        })
    })
    ///////////////////////////////////

    // Delete Admin
    app.post("/deleteAdmin",verifyToken,(req,res)=>{
        console.log(`REQUEST BODY`);
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/deleteAdmin] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/deleteAdmin] - Admin Verification Successful');  
                Admin.findOneAndRemove({"adminID":req.body.adminID},(err,output)=>{
                    if(err)
                    {
                        console.log('\x1b[31m%s\x1b[1m', '[/deleteAdmin] - Failed To Delete Admin');  
                        console.log(err);
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/deleteAdmin] - Admin Deleted Successfully');  
                        res.json({is_verified:true,is_successful:true})

                    }
                })
            
            }

    })
    })
    ///////////////////////////////////

    // Change Admin Password

    app.post("/changeAdminPassword",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/changeAdminPassword] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/changeAdminPassword] - Admin Verification Successful');  
                var new_password = hash.sha256().update(req.body.new_password).digest('hex');
                console.log('\x1b[33m%s\x1b[1m',"[/changeAdminPassword - Changing Password...."); // yellow log
                Admin.findOneAndUpdate({"adminID":req.body.adminID},{"$set":{"password":new_password}},(err,callback)=>{
                    if(err){
                        console.log('\x1b[31m%s\x1b[1m', "[/changeAdminPassword] - Failed to change password :'( ");
                        res.json({is_verified:true,is_successful:false})
                        console.log(err)
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/changeAdminPassword] - Password Changed Successfully ^_^');  
                        res.json({is_verified:true,is_successful:true})
                    }
                })
            
            }

    })
    })

// Student Related API Calls

    // Create Student

    app.post('/createStudent',verifyToken,(req,res)=>
    {
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/createStudent] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/createStudent] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m',"[/createStudent] - Creating Student...."); // yellow log
                console.log(req.body);
                var student = new Student({"studentID":req.body.studentID,"name":req.body.studentName,"password":hash.sha256().update(req.body.password).digest('hex'),"email":req.body.studentEmail,"contact":req.body.studentContact,"packs":req.body.packs});
                Student.syncIndexes();
                student.save((err,output)=>{
                    if(err)
                    {
                        console.log('\x1b[31m%s\x1b[1m', "[/createStudent] - Failed to create student :'( ");
                        console.log(err);
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/createStudent] - Student created successfully');                  
                        res.json({is_verified:true,is_successful:true})
                    }
                })
            }

    })
    })

     // Student Login
     app.post('/loginStudent',(req,res)=>{
        var password = req.body.password;
        console.log(password);
        var hashed_password = hash.sha256().update(req.body.password).digest('hex');
        console.log('\x1b[33m%s\x1b[1m', '[/loginStudent] - Verifying Student...'); //yellow log
        Student.syncIndexes();
        Student.findOne({$and:[{"studentID":req.body.studentID},{"password": hashed_password}]},(err,student)=>{
            if(err || !student){
                console.log('\x1b[31m%s\x1b[1m', '[/loginStudent] - Student Does not exist.');  //red log
                console.log(err)
                res.json({logged_in:false})
            }
            else{
                console.log('\x1b[32m%s\x1b[1m',"[/loginStudent - Student Found"); // green log
                console.log('\x1b[33m%s\x1b[1m',"[/loginStudent - Generating Token...."); // yellow log
                jwt.sign(student.toJSON(),"pe-tests-student",(err,token)=>{
                    if(err){
                        console.log('\x1b[31m%s\x1b[1m',"[/loginStudent] - Error Generating Student Token:"); //red log
                        console.log(err)
                        res.json({is_verified:true,is_successful:false})
                    }
                    else {
                        console.log('\x1b[32m%s\x1b[1m',"[/loginStudent] - Student Token Generated"); // green log
                        res.json({is_verified:true,"student_token":token,"student":student,is_successful:true});
                    }
                })
            }
        })
})

    // get Student Packs
    app.post("/getStudentPacks",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/getStudentPacks] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/getStudentPacks] - Admin Verification Successful');  
                var student = Student.find({"studentID":req.body.studentID},(err,student)=>{
                    if(err || !student)
                    {
                        console.log('\x1b[31m%s\x1b[1m', '[/getStudentPacks] - Failed to get Student'); 
                        console.log(err); 
                        res.json({is_verified:true,is_successful:false})

                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/getStudentPacks] - Student Fetched'); 
                        console.log(student);
                        res.json({is_verified:true,is_successful:true,packs:student[0].packs})
                    }
                })
            }

    })})
    // get Students
    app.get("/getStudents",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/getStudents] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/getStudents] - Admin Verification Successful');  
                
                var students = Student.find({},(err,students)=>{
                    if(err || !students)
                    {
                        console.log('\x1b[31m%s\x1b[1m', '[/getStudents] - Failed to get Students'); 
                        console.log(err); 
                        res.json({is_verified:true,is_successful:false})

                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/getStudents] - Students Fetched Successful'); 
                        console.log(students) 
                        res.json({is_verified:true,is_successful:true,students:students})
                    }
                })
            }

    })})

    // change student Password
    app.post("/changeStudentPassword",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/changeStudentPassword] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/changeStudentPassword] - Admin Verification Successful');  
                var new_password = hash.sha256().update(req.body.new_password).digest('hex');
                console.log('\x1b[33m%s\x1b[1m',"[/changeStudentPassword - Changing Password...."); // yellow log
                Student.findOneAndUpdate({"studentID":req.body.studentID},{"$set":{"password":new_password}},(err,callback)=>{
                    if(err){
                        console.log('\x1b[31m%s\x1b[1m', "[/changeStudentPassword] - Failed to change password :'( ");
                        res.json({is_verified:true,is_successful:false})
                        console.log(err)
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/changeStudentPassword] - Password Changed Successfully ^_^');  
                        res.json({is_verified:true,is_successful:true})
                    }
                })
            
            }

    })
    })
    
    // Delete Student
    app.post("/addStudentPack",verifyToken,(req,res)=>{
        console.log(`REQUEST BODY`);
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/addStudentPack] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/addStudentPack] - Admin Verification Successful');  
                Student.findOneAndUpdate({"studentID":req.body.studentID},{$addToSet:{"packs":req.body.pack}},(err,output)=>{
                    if(err)
                    {
                        console.log('\x1b[31m%s\x1b[1m', '[/addStudentPack] - Failed To add Pack');  
                        console.log(err);
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/addStudentPack] - Pack Registered');  
                        res.json({is_verified:true,is_successful:true})

                    }
                })
            
            }

    })
    })


    app.post("/deleteStudent",verifyToken,(req,res)=>{
        console.log(`REQUEST BODY`);
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/deleteStudent] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/deleteStudent] - Admin Verification Successful');  
                Student.findOneAndRemove({"studentID":req.body.studentID},(err,output)=>{
                    if(err)
                    {
                        console.log('\x1b[31m%s\x1b[1m', '[/deleteStudent] - Failed To Delete Student');  
                        console.log(err);
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/deleteStudent] - Admin Student Successfully');  
                        res.json({is_verified:true,is_successful:true})

                    }
                })
            
            }

    })
    })

    // Change Student Email

    app.post("/changeStudentEmail",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/changeStudentEmail] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/changeStudentEmail] - Admin Verification Successful');  
                var new_email = req.body.new_email;
                console.log('\x1b[33m%s\x1b[1m',"[/changeStudentemail - Changing Email ID...."); // yellow log
                Student.findOneAndUpdate({"studentID":req.body.studentID},{"$set":{"email":new_email}},(err,callback)=>{
                    if(err){
                        console.log('\x1b[31m%s\x1b[1m', "[/changeStudentEmail] - Failed to change email :'( ");
                        res.json({is_verified:true,is_successful:false})
                        console.log(err);
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/changeStudentEmail] - Email Changed Successfully ^_^');  
                        res.json({is_verified:true,is_successful:true})
                    }
                })
            
            }

    })
    })
    // Change Student Contact
    app.post("/changeStudentContact",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/changeStudentContact] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/changeStudentContact] - Admin Verification Successful');  
                var new_contact = req.body.new_contact;
                console.log('\x1b[33m%s\x1b[1m',"[/changeStudentContact - Changing Contact No...."); // yellow log
                Student.findOneAndUpdate({"studentID":req.body.studentID},{"$set":{"contact":new_contact}},(err,callback)=>{
                    if(err){
                        console.log('\x1b[31m%s\x1b[1m', "[/changeStudentContact] - Failed to change contact no :'( ");
                        res.json({is_verified:true,is_successful:false})
                        console.log(err)
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/changeStudentContact] - Contact No.  Changed Successfully ^_^');  
                        res.json({is_verified:true,is_successful:true})
                    }
                })
            
            }
            
    })
    })

    // Remove Pack From Student
    app.post("/removePackFromStudent",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/removePackFromStudent] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/removePackFromStudent] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m',"[/removePackFromStudent - Removing Pack From Student...."); // yellow log
                Student.findOneAndUpdate({"studentID":req.body.studentID},{"$pull":{"packs":req.body.pack}},(err,callback)=>{
                    if(err){
                        console.log('\x1b[31m%s\x1b[1m', "[/removePackFromStudent] - Failed to remove pack :'( ");
                        console.log(err)
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/removePackFromStudent] - Pack Removed Successfully ^_^');  
                        res.json({is_verified:true,is_successful:true})
                    }
                })
            
            }
            
    })
    })

    // Add Pack To Student
    app.post("/addPackToStudent",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/addPackToStudent] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/addPackToStudent] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m',"[/addPackToStudent - Adding Pack To Student...."); // yellow log
                Student.findOneAndUpdate({"studentID":req.body.studentID},{"$addToSet":{"packs":req.body.pack}},(err,callback)=>{
                    if(err){
                        console.log('\x1b[31m%s\x1b[1m', "[/addPackToStudent] - Failed to add pack :'( ");
                        console.log(err)
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/addPackToStudent] - Pack added Successfully ^_^');  
                        res.json({is_verified:true,is_successful:true})
                    }
                })
            
            }
            
    })
    })

// Syllabus Related API Calls

    // Get Full Syllabus
        app.get("/getFullSyllabus",verifyToken,(req,res)=>{
            jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
                if(err){
                    console.log('\x1b[31m%s\x1b[1m', '[/getFullSyllabus] - Admin Verification Failed');  
                    console.log(err);
                    jwt.verify(req.token,'pe-tests-student',(err,authData)=>{
                        if(err){
                            console.log('\x1b[31m%s\x1b[1m', '[/getFullSyllabus] - Admin Verification Failed');  
                            console.log(err);
                            res.json({is_verified:false})
                        }
                        else
                        {
                            console.log('\x1b[32m%s\x1b[1m', '[/getFullSyllabus] - Admin Verification Successful');  
                            console.log('\x1b[33m%s\x1b[1m', '[/getFullSyllabus] - Fetching full syllabus...');
                            Syllabus.syncIndexes();
                            Syllabus.find({},(err,syllabus)=>{
                                if(err || !syllabus){
                                    console.log('\x1b[31m%s\x1b[1m', "[/getFullSyllabus] - Failed to fetch syllabus :'( ");
                                    res.json({is_verified:true,is_successful:false})
                                }
                                else
                                {
                                    console.log('\x1b[32m%s\x1b[1m', '[/getFullSyllabus] - Fetched Syllabus Successfully ^_^');  
                                    console.log(syllabus);
                                    res.json({is_verified:true,is_successful:true,syllabus:syllabus})
                                }
                            })
                        
                        }
                        
                })
                }
                else
                {
                    console.log('\x1b[32m%s\x1b[1m', '[/getFullSyllabus] - Admin Verification Successful');  
                    console.log('\x1b[33m%s\x1b[1m', '[/getFullSyllabus] - Fetching full syllabus...');
                    Syllabus.syncIndexes();
                    Syllabus.find({},(err,syllabus)=>{
                        if(err || !syllabus){
                            console.log('\x1b[31m%s\x1b[1m', "[/getFullSyllabus] - Failed to fetch syllabus :'( ");
                            res.json({is_verified:true,is_successful:false})
                        }
                        else
                        {
                            console.log('\x1b[32m%s\x1b[1m', '[/getFullSyllabus] - Fetched Syllabus Successfully ^_^');  
                            console.log(syllabus);
                            res.json({is_verified:true,is_successful:true,syllabus:syllabus})
                        }
                    })
                
                }
                
        })
        })
    // Create Domain
    app.post("/createDomain",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/createDomain] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false}) 
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/createDomain] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/createDomain] - Creating new domain...');
                Syllabus.insertMany({"name":req.body.domain_name},(err,Domain)=>{
                    if(err || !Domain){
                        console.log('\x1b[31m%s\x1b[1m', "[/createDomain] - Failed to create domain :'( ");
                        console.log(err)
                        res.json({is_verified:true,is_successful:false})

                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/createDomain] - Created Domain :) ');  
                        res.json({is_verified:true,is_successful:true,domain:Domain})

                    }
                })
            }
        })
    })
    // Delete Domain
    app.post("/deleteDomain",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/deleteDomain] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false}) 
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/deleteDomain] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/deleteDomain] - Deleting Domain...');
                Syllabus.findOneAndRemove({"name":req.body.domain_name},(err,Domain)=>{
                    if(err || !Domain){
                        console.log('\x1b[31m%s\x1b[1m', "[/deleteDomain] - Failed to delete Domain :'( ");
                        console.log(err)
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/deleteDomain] - Domain Deleted Successfully :) ');  
                        res.json({is_verified:true,is_successful:true,domain:Domain})
                    }
                })
            }
        })
    })

    // Add Subject To a Domain
    app.post("/addSubjectToDomain",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/addSubjectToDomain] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/addSubjectToDomain] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/addSubjectToDomain] - Adding Subject to domain...');
                subject_name = req.body.subject_name;
                domain_id = req.body.domain_id;
                Syllabus.findByIdAndUpdate(domain_id,{$addToSet:{"Subjects":{"name":subject_name}}},(err,updatedDomain)=>{
                    if(err || !updatedDomain)
                    {
                        console.log('\x1b[31m%s\x1b[1m', "[/addSubjectToDomain] - Failed to add subject :'( ");
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/addSubjectToDomain] - Added Subject Successfully ^_^');  
                        res.json({is_verified:true,is_successful:true,subject:subject_name})
                    }
                })            
            }
            
    })
    })

    // Delete Subject From Domain 
    app.post("/deleteSubjectFromDomain",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/deleteSubjectFromDomain] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/deleteSubjectFromDomain] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/deleteSubjectFromDomain] - Deleting Subject from domain...');
                subject_name = req.body.subject_name;
                domain_name = req.body.domain_name;
                Syllabus.findOneAndUpdate({$and:[{"name":domain_name},{"Subjects.name":subject_name}]},{$pull:{"Subjects":{"name":subject_name}}},(err,updatedDomain)=>{
                    if(err || !updatedDomain)
                    {
    
                        console.log('\x1b[31m%s\x1b[1m', "[/deleteSubjectFromDomain] - Failed to delete subject :'( ");
                        console.log(err);
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/deleteSubjectFromDomain] - Deleted Subject Successfully ^_^');  
                        res.json({is_verified:true,is_successful:true})
                    }
                })            
            }
            
    })
    })

    // Add Chapter to Subject
    app.post("/addChapterToSubject",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/addChapterToSubject] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/addChapterToSubject] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/addChapterToSubject] - Adding chapter to subject...');
                subject_name = req.body.subject_name;
                domain_name = req.body.domain_name;
                chapter_name = req.body.chapter_name;
                Syllabus.findOneAndUpdate({$and:[{"name":domain_name},{"Subjects.name":subject_name}]},{$addToSet:{"Subjects.$.Chapters":{"name":chapter_name}}},(err,updatedDomain)=>{
                    if(err || !updatedDomain)
                    {
    
                        console.log('\x1b[31m%s\x1b[1m', "[/addChapterToSubject] - Failed to add chapter to subject :'( ");
                        console.log(err);
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/addChapterToSubject] - added chapter to subject successfully ^_^');  
                        res.json({is_verified:true,is_successful:true})
                    }
                })            
            }
            
    })
    })

    // Delete Chapter From Subject 
    app.post("/deleteChapterFromSubject",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/deleteChapterFromSubject] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/deleteChapterFromSubject] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/deleteChapterFromSubject] - Deleting chapter to subject...');
                subject_name = req.body.subject_name;
                domain_name = req.body.domain_name;
                chapter_name = req.body.chapter_name;
                Syllabus.findOneAndUpdate({$and:[{"name":domain_name},{"Subjects.name":subject_name}]},{$pull:{"Subjects.$.Chapters":{"name":chapter_name}}},(err,updatedDomain)=>{
                    if(err || !updatedDomain)
                    {
    
                        console.log('\x1b[31m%s\x1b[1m', "[/deleteChapterFromSubject] - Failed to delete chapter from subject :'( ");
                        console.log(err);
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/deleteChapterFromSubject] - deleted chapter from subject successfully ^_^');  
                        res.json({is_verified:true,is_successful:true})
                    }
                })            
            }
            
    })
    })
    

    // Add Section To Subject
    app.post("/addSectionToSubject",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/addSectionToSubject] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/addSectionToSubject] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/addSectionToSubject] - Adding chapter to subject...');
                subject_name = req.body.subject_name;
                domain_name = req.body.domain_name;
                section_name = req.body.section_name;
                Syllabus.findOneAndUpdate({$and:[{"name":domain_name},{"Subjects.name":subject_name}]},{$addToSet:{"Subjects.$.Sections":{"name":section_name}}},(err,updatedDomain)=>{
                    if(err || !updatedDomain)
                    {
    
                        console.log('\x1b[31m%s\x1b[1m', "[/addSectionToSubject] - Failed to add section to subject :'( ");
                        console.log(err);
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/addSectionToSubject] - added section to subject successfully ^_^');  
                        res.json({is_verified:true,is_successful:true})
                    }
                })            
            }
            
    })
    })

    // Delete Section From Subject
    app.post("/deleteSectionFromSubject",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/deleteSectionFromSubject] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/deleteSectionFromSubject] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/deleteSectionFromSubject] - Deleting section from subject...');
                subject_name = req.body.subject_name;
                domain_name = req.body.domain_name;
                section_name = req.body.section_name;
                Syllabus.findOneAndUpdate({$and:[{"name":domain_name},{"Subjects.name":subject_name}]},{$pull:{"Subjects.$.Sections":{"name":section_name}}},(err,updatedDomain)=>{
                    if(err || !updatedDomain)
                    {
    
                        console.log('\x1b[31m%s\x1b[1m', "[/deleteSectionFromSubject] - Failed to delete section from subject :'( ");
                        console.log(err);
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/deleteSectionFromSubject] - deleted section from subject successfully ^_^');  
                        res.json({is_verified:true,is_successful:true})
                    }
                })            
            }
    })
    })


    // Add Topic To Chapter
    app.post("/addTopicToChapter",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/addTopicToChapter] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/addTopicToChapter] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/addTopicToChapter] - Adding topic to chapter...');
                subject_name = req.body.subject_name;
                domain_name = req.body.domain_name;
                chapter_name = req.body.chapter_name;
                topic_name = req.body.topic_name;
                Syllabus.findOneAndUpdate({$and:[{"name":domain_name},{"Subjects.name":subject_name}]},{$addToSet:{"Subjects.$.Topics":{"name":topic_name,"chapter":chapter_name}}},(err,updatedDomain)=>{
                    if(err || !updatedDomain)
                    {
    
                        console.log('\x1b[31m%s\x1b[1m', "[/addTopicToChapter] - Failed to add topic to chapter :'( ");
                        console.log(err);
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/addTopicToChapter] - added topic to chapter successfully ^_^');  
                        res.json({is_verified:true,is_successful:true})
                    }
                })            
            }
            
    })
    })
    
    app.post("/deleteTopicFromChapter",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/deleteTopicFromChapter] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/deleteTopicFromChapter] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/deleteTopicFromChapter] - Deleting topic from chapter...');
                subject_name = req.body.subject_name;
                domain_name = req.body.domain_name;
                chapter_name = req.body.chapter_name;
                topic_name = req.body.topic_name
                Syllabus.findOneAndUpdate({$and:[{"name":domain_name},{"Subjects.name":subject_name}]},{$pull:{"Subjects.$.Topics":{"name":topic_name,"chapter":chapter_name}}},(err,updatedDomain)=>{
                    if(err || !updatedDomain)
                    {
    
                        console.log('\x1b[31m%s\x1b[1m', "[/deleteSectionFromSubject] - Failed to delete section from subject :'( ");
                        console.log(err);
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/deleteSectionFromSubject] - deleted section from subject successfully ^_^');  
                        res.json({is_verified:true,is_successful:true})
                    }
                })            
            }
    })
    })


// Test Creation API Calls

    // Create FST Test
    app.post("/createFST",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/createFST] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/createFST] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/createFST] - Creating FST Test...');
                var question_images_white = [];
                var question_images_black = [];
                var answer_images_white = [];
                var answer_images_black = [];
              
                req.files.forEach((file)=>{
                    if(file.originalname == "questionBlack")
                    {
                        question_images_black.push(file.buffer);
                    }

                    if(file.originalname == "questionWhite")
                    {
                        question_images_white.push(file.buffer)
                    }

                    if(file.originalname == "answerWhite")
                    {
                        answer_images_white.push(file.buffer)
                    }

                    if(file.originalname == "answerBlack")
                    {
                        answer_images_black.push(file.buffer)
                    }
                })
                console.log(req.body);
                var test = new Test();
                test.test_name = req.body.test_name;
                test.test_type = req.body.test_type;
                test.domain = req.body.domain;
                test.questions = JSON.parse(req.body.questions);
                test.correct_marks = req.body.correct_marks;
                test.wrong_marks = req.body.wrong_marks;
                test.answer_key = JSON.parse(req.body.answer_key);
                test.DLevel_details = JSON.parse(req.body.DLevel_details);
                test.subject_details = JSON.parse(req.body.subject_details);
                test.section_details = JSON.parse(req.body.section_details);
                test.chapter_details = JSON.parse(req.body.chapter_details);
                test.topic_details = JSON.parse(req.body.topic_details);
                test.question_images_white = question_images_white;
                test.duration = req.body.duration;
                test.question_images_black = question_images_black;
                test.answer_images_white = answer_images_white;
                test.answer_videos = JSON.parse(req.body.answer_videos);
                test.answer_images_black = answer_images_black;
                console.log(` ------- TEST OBJECT ------  `)
                test.save((err,output)=>{
                    if(err)
                    {
                        res.json({is_verified:true,is_successful:false})
                        console.log(err);
                    }
                    else
                    {
                        res.json({is_verified:true,is_successful:true})
                        console.log("TEST SAVED");
                    }
                })
            }
    })
    })

    // Create CWT
    app.post("/createCWT",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/createCWT] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/createCWT] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/createCWT] - Creating CWT Test...');
                var question_images_white = [];
                var question_images_black = [];
                var answer_images_white = [];
                var answer_images_black = [];
              
                req.files.forEach((file)=>{
                    if(file.originalname == "questionBlack")
                    {
                        question_images_black.push(file.buffer);
                    }

                    if(file.originalname == "questionWhite")
                    {
                        question_images_white.push(file.buffer)
                    }

                    if(file.originalname == "answerWhite")
                    {
                        answer_images_white.push(file.buffer)
                    }

                    if(file.originalname == "answerBlack")
                    {
                        answer_images_black.push(file.buffer)
                    }
                })
                console.log(req.body);
                var test = new Test();
                test.test_name = req.body.test_name;
                test.test_type = req.body.test_type;
                test.domain = req.body.domain;
                test.subject = req.body.subject;
                test.chapter = req.body.chapter;
                test.questions = JSON.parse(req.body.questions);
                test.correct_marks = req.body.correct_marks;
                test.wrong_marks = req.body.wrong_marks;
                test.answer_key = JSON.parse(req.body.answer_key);
                test.DLevel_details = JSON.parse(req.body.DLevel_details);
                test.subject_details = JSON.parse(req.body.subject_details);
                test.section_details = JSON.parse(req.body.section_details);
                test.chapter_details = JSON.parse(req.body.chapter_details);
                test.topic_details = JSON.parse(req.body.topic_details);
                test.question_images_white = question_images_white;
                test.duration = req.body.duration;
                test.question_images_black = question_images_black;
                test.answer_images_white = answer_images_white;
                test.answer_videos = JSON.parse(req.body.answer_videos);
                test.answer_images_black = answer_images_black;
                console.log(` ------- TEST OBJECT ------  `)
                test.save((err,output)=>{
                    if(err)
                    {
                        res.json({is_verified:true,is_successful:false})
                        console.log(err);
                    }
                    else
                    {
                        res.json({is_verified:true,is_successful:true})
                        console.log("CWT Created");
                    }
                })
            }
    })
    })

     // Create CWT
     app.post("/createSWT",verifyToken,(req,res)=>{
         Test.syncIndexes();
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/createSWT] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/createSWT] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/createSWT] - Creating SWT Test...');
                var question_images_white = [];
                var question_images_black = [];
                var answer_images_white = [];
                var answer_images_black = [];
              
                req.files.forEach((file)=>{
                    if(file.originalname == "questionBlack")
                    {
                        question_images_black.push(file.buffer);
                    }

                    if(file.originalname == "questionWhite")
                    {
                        question_images_white.push(file.buffer)
                    }

                    if(file.originalname == "answerWhite")
                    {
                        answer_images_white.push(file.buffer)
                    }

                    if(file.originalname == "answerBlack")
                    {
                        answer_images_black.push(file.buffer)
                    }
                })
                console.log(req.body);
                var test = new Test();
                test.test_name = req.body.test_name;
                test.test_type = req.body.test_type;
                test.domain = req.body.domain;
                test.subject = req.body.subject;
                test.questions = JSON.parse(req.body.questions);
                test.correct_marks = req.body.correct_marks;
                test.wrong_marks = req.body.wrong_marks;
                test.answer_key = JSON.parse(req.body.answer_key);
                test.DLevel_details = JSON.parse(req.body.DLevel_details);
                test.subject_details = JSON.parse(req.body.subject_details);
                test.section_details = JSON.parse(req.body.section_details);
                test.chapter_details = JSON.parse(req.body.chapter_details);
                test.topic_details = JSON.parse(req.body.topic_details);
                test.question_images_white = question_images_white;
                test.duration = req.body.duration;
                test.question_images_black = question_images_black;
                test.answer_images_white = answer_images_white;
                test.answer_videos = JSON.parse(req.body.answer_videos);
                test.answer_images_black = answer_images_black;
                console.log(` ------- TEST OBJECT ------  `)
                test.save((err,output)=>{
                    if(err)
                    {
                        res.json({is_verified:true,is_successful:false})
                        console.log(err);
                    }
                    else
                    {
                        res.json({is_verified:true,is_successful:true})
                        console.log("CWT Created");
                    }
                })
            }
    })
    })

    // Test Getters

    //getAllFST
    app.get("/getAllFST",verifyToken,(req,res)=>{

        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/getAllFST] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/getAllFST] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/getAllFST] - Feteching All FST Tests...');  
                Test.find({"test_type":"FST"},{"test_name":1},(err,fst_tests)=>{
                    if(err)
                    {
                        console.log('\x1b[31m%s\x1b[1m', '[/getAllFST] - Failed to fetch FSTs');
                        console.log(err)  
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/getAllFST] - Fetched all FSTs');  
                        res.json({is_verified:true,is_successful:true,fst_tests:fst_tests})
                    }
                })
            }
    })
    })

    //getAllCWT
    app.get("/getAllCWT",verifyToken,(req,res)=>{

        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/getAllCWT] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/getAllCWT] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/getAllCWT] - Feteching All CWT Tests...');  
                Test.find({"test_type":"CWT"},{"test_name":1},(err,fst_tests)=>{
                    if(err)
                    {
                        console.log('\x1b[31m%s\x1b[1m', '[/getAllCWT] - Failed to fetch CWTs');
                        console.log(err)  
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/getAllCWT] - Fetched all CWTs');  
                        res.json({is_verified:true,is_successful:true,fst_tests:fst_tests})
                    }
                })
            }
    })
    })

    //getAllSWT
    app.get("/getAllSWT",verifyToken,(req,res)=>{

        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/getAllSWT] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/getAllSWT] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/getAllSWT] - Feteching All SWT Tests...');  
                Test.find({"test_type":"SWT"},{"test_name":1},(err,fst_tests)=>{
                    if(err)
                    {
                        console.log('\x1b[31m%s\x1b[1m', '[/getAllSWT] - Failed to fetch SWTs');
                        console.log(err)  
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/getAllSWT] - Fetched All SWTs');  
                        res.json({is_verified:true,is_successful:true,fst_tests:fst_tests})
                    }
                })
            }
    })
    })


    //getSpecificFST
    app.post("/getSpecificFST",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-student',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/getSpecificFST] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
                    
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/getSpecificFST] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/getSpecificFST] - Feteching All SWT Tests...');  
                Test.find({$and:[{"domain":req.body.domain},{"test_type":"FST"}]},{"test_name":1
                },(err,tests)=>{
                    if(err)
                    {
                        console.log('\x1b[31m%s\x1b[1m', '[/getSpecificFST] - Failed to fetch FSTs');
                        console.log(err)  
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/getSpecificTest] - Fetched All FSTs');
                        res.json({is_verified:true,is_successful:true,fst_tests:tests})  
                    }
                })
            }
    })})
    // GetSpecificCWT
    app.post("/getSpecificCWT",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-student',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/getSpecificCWT] - Student Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
                    
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/getSpecificCWT] - Student Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/getSpecificCWT] - Feteching CWT Tests...');  
                Test.find({$and:[{"domain":req.body.domain},{"test_type":"CWT"},{"subject":req.body.subject},{"chapter":req.body.chapter}]},{"test_name":1
                },(err,tests)=>{
                    if(err)
                    {
                        console.log('\x1b[31m%s\x1b[1m', '[/getSpecificCWT] - Failed to fetch CWTs');
                        console.log(err)  
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/getSpecificCWT] - Fetched CWT');
                        res.json({is_verified:true,is_successful:true,cwt_tests:tests})  
                    }
                })
            }
    })})
    // getSpecificSWT
    app.post("/getSpecificSWT",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-student',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/getSpecificSWT] - Student Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
                    
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/getSpecificSWT] - Student Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/getSpecificSWT] - Feteching SWT Tests...');  
                Test.find({$and:[{"domain":req.body.domain},{"test_type":"SWT"},{"subject":req.body.subject}]},{"test_name":1
                },(err,tests)=>{
                    if(err)
                    {
                        console.log('\x1b[31m%s\x1b[1m', '[/getSpecificSWT] - Failed to fetch SWts');
                        console.log(err)  
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/getSpecificSWT] - Fetched SWTs');
                        res.json({is_verified:true,is_successful:true,swt_tests:tests})  
                    }
                })
            }
    })})


    // get BasicDetails
    app.post('/getTestBasicDetails',verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-student',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/getTestBasicDetails] - Student Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
                    
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/getTestBasicDetails] - Student Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/getTestBasicDetails] - Feteching SWT Tests...');  
                Test.find({"test_name":req.body.test_name},{"test_name":1,"duration":1,"correct_marks":1,
                "wrong_marks":1
                },(err,tests)=>{
                    if(err)
                    {
                        console.log('\x1b[31m%s\x1b[1m', '[/getTestBasicDetails] - Failed to fetch basic test details');
                        console.log(err)  
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/getTestBasicDetails] - Fetched basic test details');
                        res.json({is_verified:true,is_successful:true,basic_details:tests[0]})  
                    }
                })
            }
    })
    })
    //getTest

    app.post(`/getTest`,verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/getTest] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/getTest] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/getTest] - Feteching Test...');  
                Test.find({"test_name":req.body.test_name},(err,test)=>{
                    if(err)
                    {
                        console.log('\x1b[31m%s\x1b[1m', '[/getTest] - Failed to fetch Test');
                        console.log(err)  
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/getTest] - Fetched Test');  
                        var new_test = test;
                        // ReConvert buffer to base64 string for question black images
                        for(var i=0;i<test[0].question_images_black.length;i++)
                        {
                            new_test[0].question_images_black[i] = new Buffer(test[0].question_images_black[i]).toString('base64');
                        }
                        // Reconvert buffer to base64 string for question white images
                        for(var i=0;i<test[0].question_images_white.length;i++)
                        {
                            new_test[0].question_images_white[i] = new Buffer(test[0].question_images_white[i]).toString('base64');
                        }
                         // Reconvert buffer to base64 string for answer white images
                         for(var i=0;i<test[0].answer_images_white.length;i++)
                         {
                             new_test[0].answer_images_white[i] = new Buffer(test[0].answer_images_white[i]).toString('base64');
                         }
                           // ReConvert buffer to base64 string for answer black images
                        for(var i=0;i<test[0].answer_images_black.length;i++)
                        {
                            new_test[0].answer_images_black[i] = new Buffer(test[0].answer_images_black[i]).toString('base64');
                        }
                        res.json({is_verified:true,is_successful:true,test:new_test[0]})
                    }
                })
            }
    })
    })
    // Modify Test

    app.post('/modifyTest',verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-admin',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/modifyTest] - Admin Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/modifyTest] - Admin Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/modifyTest] - Modifying Test...');  
                var question_images_white = [];
                var question_images_black = [];
                var answer_images_white = [];
                var answer_images_black = [];
                var duration = req.body.duration; 
                var test_name = req.body.test_name;
                var answer_videos = req.body.answer_videos;
                var answer_key = req.body.answer_key;
                // Create buffers from base64 strings
                req.body.question_images_white.forEach(image=>{
                    console.log("IMAGE BASE 64");
                    question_images_white.push(new Buffer(image.split(",")[1],"base64"));
                })

                req.body.question_images_black.forEach(image=>{
                    question_images_black.push(new Buffer(image.split(",")[1],"base64"));
                })

                req.body.answer_images_white.forEach(image=>{
                    answer_images_white.push(new Buffer(image.split(",")[1],"base64"));
                })

                req.body.answer_images_black.forEach(image=>{
                    answer_images_black.push(new Buffer(image.split(",")[1],"base64"));
                })
                console.log(`test name is ${test_name}`);
                // Modify the test
                Test.findOneAndUpdate({"test_name":test_name},{$set:{"duration":duration,"answer_key":answer_key,"answer_videos":answer_videos,"question_images_white":question_images_white,"question_images_black":question_images_black,"answer_images_white":answer_images_white,"answer_images_black":answer_images_black}},(err,output)=>{
                    if(err || output==null || output=="")
                    {
                        console.log('\x1b[31m%s\x1b[1m', '[/modifyTest] - Failed to Modify Test');
                        console.log(err);
                        res.json({is_verified:true,is_successful:false})
                    }
                    else
                    {
                        console.log('\x1b[32m%s\x1b[1m', '[/modifyTest] - Modified Test Successfuly');  
                        res.json({is_verified:true,is_successful:true})
                    }
                })
            }
    })
    })

    // Start User Test
    app.post("/startUserTest",verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-student',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/startUserTest] - Student Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/startUserTest] - Student Verification Successful');  
                studentID = req.body.studentID;
                test_name = req.body.test_name;
                // Check if the user has already given test
                Test.findOne({$and:[{"test_name":test_name,"taken_by":studentID}]},(err,test)=>{
                    if(err)
                    {
                        res.json({is_verified:true,is_successful:false})
                    }
                    else if(test==null)
                    {
                        // Student has not given the test before
                        Test.findOne({"test_name":test_name},(err,test)=>{
                            if(err || test==null)
                            {
                                res.json({is_verified:true,is_successful:false})
                            }
                            else
                            {
                                res.json({is_verified:true,is_successful:true,given_before:false})
                            }
                        })
                    }
                    else
                    {
                        // Student has given the test before
                        res.json({is_verified:true,is_successful:true,given_before:true})
                    }
                })
            }
    })
    })

    // VerifyAndGetTest
    app.post(`/VerifyPackAndGetTest`,verifyToken,(req,res)=>{
        jwt.verify(req.token,'pe-tests-student',(err,authData)=>{
            if(err){
                console.log('\x1b[31m%s\x1b[1m', '[/VerifyPackAndGetTest] - Student Verification Failed');  
                console.log(err);
                res.json({is_verified:false})
            }
            else
            {
                console.log('\x1b[32m%s\x1b[1m', '[/VerifyPackAndGetTest] - Student Verification Successful');  
                console.log('\x1b[33m%s\x1b[1m', '[/VerifyPackAndGetTest] - Verifying Student Pack...'); 
                var studentID = req.body.studentID;
                var test_name = req.body.test_name; 

                // First Check if student has already given test
                Test.findOne({$and:[{"test_name":test_name,"taken_by":studentID}]},(err,test)=>{
                    if(err)
                    {
                        res.json({is_verified:true,is_successful:false})
                    }
                    else if(test==null)
                    {
                        // Student has not given the test before
                        Test.findOne({"test_name":test_name},(err,test)=>{
                            if(err || test==null)
                            {
                                res.json({is_verified:true,is_successful:false})
                            }
                            else
                            {
                                // Student has not  given test before
                                // Get Student Packs
                                Student.findOne({"studentID":studentID},(err,student)=>{
                                    if(err || student==null)
                                    {
                                        console.log('\x1b[31m%s\x1b[1m', '[/VerifyPackAndGetTest] - Student Not Found');  
                                    }
                                    else
                                    {
                                        pack_valid=1;
                                        // Step 1 : Identify Type of Test
                                        var test_type = test.test_type;
                                        if(test_type=="FST")
                                        {
                                            // Check domain
                                            if(test.domain=="NEET")
                                            {
                                                if(student.packs.includes("NEET_PCB")==false)
                                                {
                                                    pack_valid=0;
                                                }
                                            }
                                            else if(test.domain=="JEE_MAINS")
                                            {
                                                if(student.packs.includes("JEE_MAINS_PCM")==false)
                                                {
                                                    pack_valid=0;
                                                }
                                            }
                                            else if(test.domain=="JEE_ADVANCED")
                                            {
                                                if(student.packs.includes("JEE_ADVANCED_PCM")==false)
                                                {
                                                    pack_valid=0;
                                                }
                                            }
                                            else if(test.domain=="STATE_ENTRANCES")
                                            {
                                                if(student.packs.includes("STATE_ENTRANCES_PCMB")==false && student.packs.includes("STATE_ENTRANCES_PCM")==false && student.packs.includes("STATE_ENTRANCES_PCB")==false) 
                                                {
                                                    pack_valid=0;
                                                }
                                            }
                                        }
                                        else
                                        {
                                            // NEET CWT OR SWT
                                            if(test.domain=="NEET")
                                            {
                                                if(test.subject=="Physics")
                                                {
                                                    if(student.packs.includes("NEET_PCB")==false && student.packs.includes("NEET_P")==false)
                                                    {
                                                        pack_valid=0;
                                                    }
                                                }
                                                else if(test.subject=="Chemistry")
                                                {
                                                    if(student.packs.includes("NEET_PCB")==false && student.packs.includes("NEET_C")==false)
                                                    {
                                                        pack_valid=0;
                                                    }
                                                }
                                                else if(test.subject=="Biology")
                                                {
                                                    if(student.packs.includes("NEET_PCB")==false && student.packs.includes("NEET_B")==false)
                                                    {
                                                        pack_valid=0;
                                                    }
                                                }
                                          }
                                          else if(test.domain=="JEE_MAINS")
                                          {
                                            if(test.subject=="Physics")
                                            {
                                                if(student.packs.includes("JEE_MAINS_PCM")==false && student.packs.includes("JEE_MAINS_P")==false)
                                                {
                                                    pack_valid=0;
                                                }
                                            }
                                            else if(test.subject=="Chemistry")
                                            {
                                                if(student.packs.includes("JEE_MAINS_PCM")==false && student.packs.includes("JEE_MAINS_C")==false)
                                                {
                                                    pack_valid=0;
                                                }
                                            }
                                            else if(test.subject=="Maths")
                                            {
                                                if(student.packs.includes("JEE_MAINS_PCM")==false && student.packs.includes("JEE_MAINS_M")==false)
                                                {
                                                    pack_valid=0;
                                                }
                                            }
                                          }
                                          else if(test.domain=="JEE_ADVANCED")
                                          {
                                            if(test.subject=="Physics")
                                            {
                                                if(student.packs.includes("JEE_ADVANCED_PCM")==false && student.packs.includes("JEE_ADVANCED_P")==false)
                                                {
                                                    pack_valid=0;
                                                }
                                            }
                                            else if(test.subject=="Chemistry")
                                            {
                                                if(student.packs.includes("JEE_ADVANCED_PCM")==false && student.packs.includes("JEE_ADVANCED_C")==false)
                                                {
                                                    pack_valid=0;
                                                }
                                            }
                                            else if(test.subject=="Maths")
                                            {
                                                if(student.packs.includes("JEE_ADVANCED_PCM")==false && student.packs.includes("JEE_ADVANCED_M")==false)
                                                {
                                                    pack_valid=0;
                                                }
                                            }
                                          }
                                          else if(test.domain=="STATE_ENTRANCES")
                                          {
                                            if(test.subject=="Physics")
                                            {
                                                if(student.packs.includes("STATE_ENTRANCES_PCMB")==false && student.packs.includes("STATE_ENTRANCES_PCB")==false && student.packs.includes("STATE_ENTRANCES_PCM")==false && student.packs.includes("STATE_ENTRANCES_P")==false)
                                                {
                                                    pack_valid=0;
                                                }
                                            }
                                            else if(test.subject=="Chemistry")
                                            {
                                                if(student.packs.includes("STATE_ENTRANCES_PCMB")==false && student.packs.includes("STATE_ENTRANCES_PCB")==false && student.packs.includes("STATE_ENTRANCES_PCM")==false && student.packs.includes("STATE_ENTRANCES_C")==false)
                                                {
                                                    pack_valid=0;
                                                }
                                            }
                                            else if(test.subject=="Maths")
                                            {
                                                if(student.packs.includes("STATE_ENTRANCES_PCMB")==false && student.packs.includes("STATE_ENTRANCES_PCM")==false && student.packs.includes("STATE_ENTRANCES_M")==false)
                                                {
                                                    pack_valid=0;
                                                }
                                            }
                                            else if(test.subject=="Biology")
                                            {
                                                if(student.packs.includes("STATE_ENTRANCES_PCMB")==false && student.packs.includes("STATE_ENTRANCES_PCB")==false && student.packs.includes("STATE_ENTRANCES_B")==false)
                                                {
                                                    pack_valid=0;
                                                }
                                            }
                                          }

                                        }
                                        if(pack_valid==0) // User is not authorized to give this  test
                                        {
                                            res.json({is_verified:true,is_successful:false,unauthorized:true})
                                        }
                                        else
                                        {
                                             // LOAD TEST
                                             Test.find({"test_name":req.body.test_name},{"answer_key":0},(err,test)=>{
                                                if(err)
                                                {
                                                    console.log('\x1b[31m%s\x1b[1m', '[/VerifyPackAndGetTest] - Failed to fetch Test');
                                                    console.log(err)  
                                                    res.json({is_verified:true,is_successful:false})
                                                }
                                                else
                                                {
                                                    console.log('\x1b[32m%s\x1b[1m', '[/VerifyPackAndGetTest] -  Pack Authorized & Fetched Test');  
                                                    var new_test = test;
                                                    // ReConvert buffer to base64 string for question black images
                                                    for(var i=0;i<test[0].question_images_black.length;i++)
                                                    {
                                                        new_test[0].question_images_black[i] = new Buffer(test[0].question_images_black[i]).toString('base64');
                                                    }
                                                    // Reconvert buffer to base64 string for question white images
                                                    for(var i=0;i<test[0].question_images_white.length;i++)
                                                    {
                                                        new_test[0].question_images_white[i] = new Buffer(test[0].question_images_white[i]).toString('base64');
                                                    }
                                                     // Reconvert buffer to base64 string for answer white images
                                                     for(var i=0;i<test[0].answer_images_white.length;i++)
                                                     {
                                                         new_test[0].answer_images_white[i] = new Buffer(test[0].answer_images_white[i]).toString('base64');
                                                     }
                                                       // ReConvert buffer to base64 string for answer black images
                                                    for(var i=0;i<test[0].answer_images_black.length;i++)
                                                    {
                                                        new_test[0].answer_images_black[i] = new Buffer(test[0].answer_images_black[i]).toString('base64');
                                                    }
                                                    res.json({is_verified:true,is_successful:true,test:new_test[0]})
        
                                            } 
                                        })
                                        }
                                    }
                                })
                            }
                        })
                    }
                    else
                    {
                        // Student has given the test before
                        res.json({is_verified:true,is_successful:false,given_before:true})
                    }
                })
                 } 
    })
    })

    // SubmitTest

    app.post('/submitTest',verifyToken,(req,res)=>{
            console.log("[/submitTest] - Verifying Student")
            jwt.verify(req.token,'pe-tests-student',(err,authData)=>{
                if(err){
                    console.log('\x1b[31m%s\x1b[1m', '[/submitTest] - Admin Verification Failed');  
                    console.log(err);
                    res.json({is_verified:false})
                }
                else
                {
                    console.log('\x1b[32m%s\x1b[1m', '[/submitTest] - Admin Verification Successful'); 
                    studentID = req.body.studentID;
                    test_name = req.body.test_name;
                    user_answer_key = req.body.user_answer_key;
                    Test.syncIndexes();

                    console.log(`Student ID - ${studentID}`);
                    console.log(`Test Name - ${test_name}`);
                    console.log(`Users Answer:`);
                    console.log(user_answer_key)

                    Test.findOne({"test_name":test_name},(err,test)=>{
                        if(err || test==null)
                        {
                            console.log('\x1b[31m%s\x1b[1m', '[/submitTest] - Error in fetching test');  
                            res.json({is_verified:true,is_successful:false})
                            console.log(err)
                        }
                        else
                        {
                            var total_questions_correct=0;
                            var total_questions_unattempted=0;
                            var total_questions_wrong=0;
                            var total_marks=0;
                            var taken_count = test.test_taken_count+1;
                            var test_result = []; // 0 - Wrong, 1- Correct, 2 - Unattempted
                            // Calculation of User Question Stats
                            for(let i=0;i<test.answer_key.length;i++)
                            {
                                // Compare with user answer key
                                if(user_answer_key[i]==test.answer_key[i])
                                {
                                    test_result.push(1); // Answer is correct
                                    total_marks = total_marks + test.correct_marks;
                                    total_questions_correct+=1;
                                }
                                else if(user_answer_key[i]=="na")
                                {
                                    test_result.push(2) // Unattempted
                                    total_questions_unattempted+=1;
                                }
                                else
                                {
                                    test_result.push(0); // Answer is wrong
                                    total_marks = total_marks + test.wrong_marks; // + because wrong marks is in '-'
                                    total_questions_wrong+=1;
                                }
                            }
                    
                       
                                var subject_stats = [];
                                var section_stats = [];
                                var chapter_stats = [];
                                var topic_stats = [];
                                var dlevel_stats = [];

                                
                            // SUBJECT STATS
                                for(let i=0;i<test.subject_details.subjects.length;i++){
                                    if(test.subject_details.subjects_stats!=[])
                                    {
                                    var total_correct = test.subject_details.subjects_stats[i].total_correct;
                                    var total_wrong = test.subject_details.subjects_stats[i].total_wrong;
                                    var total_unattempted = test.subject_details.subjects_stats[i].total_unattempted;
                                     }
                                    else
                                    {
                                    var total_correct = 0;
                                    var total_wrong = 0;
                                    var total_unattempted = 0;
                                    }
                                    // Traverse each question 
                                    for(let j=0;j<test.questions.length;j++)
                                    {
                                        if(test.test_type=="CWT" || test.test_type=="SWT")
                                        {   
                                            test.questions[j].subject=test.subject;
                                        }
                                        if(test.questions[j].subject==test.subject_details.subjects[i]) // IF question belongs to that subject
                                        {
                                            if(test_result[j]==0) // Answer is wrong
                                            {
                                                total_wrong+=1;
                                            }
                                            else if(test_result[j]==1) // Answer is Correct
                                            {
                                                total_correct+=1;
                                            }
                                            else
                                            {
                                                total_unattempted+=1;
                                            }
                                        }
                                    }
                                    subject_stats.push({total_correct:total_correct,total_wrong:total_wrong,total_unattempted:total_unattempted})
                                } 
                            // SECTION STATS
                            for(let i=0;i<test.section_details.sections.length;i++){
                                if(test.section_details.sections_stats!=[])
                                {
                                var total_correct = test.section_details.sections_stats[i].total_correct;
                                var total_wrong = test.section_details.sections_stats[i].total_wrong;
                                var total_unattempted = test.section_details.sections_stats[i].total_unattempted;

                            }
                                else
                                {
                                var total_correct = 0;
                                var total_wrong = 0;
                                var total_unattempted = 0;
                                }
                                // Traverse each question 
                                for(let j=0;j<test.questions.length;j++)
                                {
                                    if(test.questions[j].section==test.section_details.sections[i]) // IF question belongs to that section
                                    {
                                        if(test_result[j]==0) // Answer is wrong
                                        {
                                            total_wrong+=1;
                                        }
                                        else if(test_result[j]==1) // Answer is Correct
                                        {
                                            total_correct+=1;
                                        }
                                        else
                                        {
                                            total_unattempted+=1;
                                        }
                                    }
                                }
                                section_stats.push({total_correct:total_correct,total_wrong:total_wrong,total_unattempted:total_unattempted})
                            } 
                            // CHAPTER STATS
                                for(let i=0;i<test.chapter_details.chapters.length;i++){
                                    if(test.chapter_details.chapters_stats!=[])
                                    {
                                    var total_correct = test.chapter_details.chapters_stats[i].total_correct;
                                    var total_wrong = test.chapter_details.chapters_stats[i].total_wrong;
                                    var total_unattempted = test.chapter_details.chapters_stats[i].total_unattempted;
                                    }
                                    else
                                    {
                                    var total_correct = 0;
                                    var total_wrong = 0;
                                    var total_unattempted = 0;
                                    }
                                    // Traverse each question 
                                    for(let j=0;j<test.questions.length;j++)
                                    {
                                        if(test.test_type=="CWT")
                                        {
                                            test.questions[j].chapter=test.chapter;
                                        }
                                        if(test.questions[j].chapter==test.chapter_details.chapters[i]) // IF question belongs to that chapter
                                        {
                                            if(test_result[j]==0) // Answer is wrong
                                            {
                                                total_wrong+=1;
                                            }
                                            else if(test_result[j]==1) // Answer is Correct
                                            {
                                                total_correct+=1;
                                            }
                                            else
                                            {
                                                total_unattempted+=1;
                                            }
                                        }
                                    }
                                    chapter_stats.push({total_correct:total_correct,total_wrong:total_wrong,total_unattempted:total_unattempted})

                                }

                                // TOPIC STATS
                                for(let i=0;i<test.topic_details.topics.length;i++){
                                    if(test.topic_details.topics_stats!=[])
                                    {
                                    var total_correct_topic = test.topic_details.topics_stats[i].total_correct;
                                    var total_wrong_topic = test.topic_details.topics_stats[i].total_wrong;
                                    var total_unattempted_topic = test.topic_details.topics_stats[i].total_unattempted;
                         
                                }
                                    else
                                    {
                                    var total_correct_topic = 0;
                                    var total_wrong_topic = 0;
                                    var total_unattempted_topic = 0;
                                    }
                                    // Traverse each question 
                                    for(let j=0;j<test.questions.length;j++)
                                    {
                                        if(test.questions[j].topic==test.topic_details.topics[i]) // IF question belongs to that topic
                                        {
                                            if(test_result[j]==0) // Answer is wrong
                                            {
                                                total_wrong_topic+=1;
                                            }
                                            else if(test_result[j]==1) // Answer is Correct
                                            {
                                                total_correct_topic+=1;
                                            }
                                            else
                                            {
                                                total_unattempted_topic+=1;
                                            }
                                        }
                                    }
                                    topic_stats.push({total_correct:total_correct_topic,total_wrong:total_wrong_topic,total_unattempted:total_unattempted_topic})
                                }
                                DLevels = ["Level 1","Level 2","Level 3"]
                                var DLevel_stats=[];
                                // DLevel1 Stats

                                for(let i=0;i<DLevels.length;i++){
                                    if(test.DLevel_details.DLevel_stats!=[])
                                    {
                                    var total_correct = test.DLevel_details.DLevel_stats[i].total_correct;
                                    var total_wrong= test.DLevel_details.DLevel_stats[i].total_wrong;
                                    var total_unattempted = test.DLevel_details.DLevel_stats[i].total_unattempted;
                                    console.log(total_wrong_topic);
                                    console.log(total_unattempted_topic);
                                }
                                    else
                                    {
                                    var total_correct = 0;
                                    var total_wrong = 0;
                                    var total_unattempted = 0;
                                    }
                                    // Traverse each question 
                                    for(let j=0;j<test.questions.length;j++)
                                    {
                                        if(test.questions[j].topic==DLevels[i]) // IF question belongs to that topic
                                        {
                                            if(test_result[j]==0) // Answer is wrong
                                            {
                                                total_wrong_topic+=1;
                                            }
                                            else if(test_result[j]==1) // Answer is Correct
                                            {
                                                total_correct_topic+=1;
                                            }
                                            else
                                            {
                                                total_unattempted_topic+=1;
                                            }
                                        }
                                    }
                                    DLevel_stats.push({total_correct:total_correct_topic,total_wrong:total_wrong_topic,total_unattempted:total_unattempted_topic})
                                }
                                
                                
                               
                             /*   console.log("SUBJECT STATS");
                                console.log(subject_stats);
                                console.log("SECTION STATS");
                                console.log(section_stats);
                                console.log("CHAPTER STATS")
                                console.log(chapter_stats);
                                console.log("TOPIC STATS");
                                console.log(topic_stats);*/
                                console.log("TOTAL MARKS"); 
                                console.log(total_marks);
                                Test.findOneAndUpdate({"test_name":test.test_name},{$set:{
                                    "section_details.sections_stats":section_stats,
                                    "topic_details.topics_stats":topic_stats,
                                    "chapter_details.chapters_stats":chapter_stats,
                                    "subject_details.subjects_stats":subject_stats,
                                    "test_taken_count":taken_count,
                                    "DLevel_details.DLevel_stats":DLevel_stats,
                                    "question_details.0.total_correct":total_questions_correct,
                                    "question_details.0.total_unattempted":total_questions_unattempted,
                                    "question_details.0.total_wrong":total_questions_wrong
                                },$addToSet:{"taken_by":studentID}},(err,output)=>{
                                    if(err || output==null)
                                    {
                                        res.json({is_verified:true,is_successful:false})
                                        console.log(err)
                                    }
                                    else
                                    {
                                        console.log("TEST HAS BEEN SUBMITTED");
                                    }
                                }) 
                        }
                    })
                   
                }
            })
    })