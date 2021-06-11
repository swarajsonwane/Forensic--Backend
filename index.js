const mysql = require('mysql');
const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const {google } = require('googleapis');
var cors = require('cors')
var multer  = require('multer')

var app = express()
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cors())
const CLIENT_ID ='895300827723-saregmm615tudn8782s76pbaiqiqe7us.apps.googleusercontent.com'

const CLIENT_SECRET='ogaQVwozguFNg_K-UH7bJjPt'
const REDIRECT_URI='https://developers.google.com/oauthplayground'
const REFRESH_TOKEN='1//048BhnQi49wJ_CgYIARAAGAQSNwF-L9Ir2_h7bT14MqiIJtXoeez16xSmtmeF-KugTcnO80Nij5zRv_5ciU95xgWxcF07ZJjHxTg'

const oauth2Client = new google.auth.OAuth2(
CLIENT_ID,
CLIENT_SECRET,
REDIRECT_URI
);

oauth2Client.setCredentials({refresh_token:REFRESH_TOKEN})

const drive = google.drive({
    version:'v3',
    auth:oauth2Client
})

const upload = multer()


var mysqlConnection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'tonystark007',
    database:'forensic_management'      

});

mysqlConnection.connect((err)=>{
    if(!err)
    console.log("DB success");
    else
    console.log("failed" + JSON.stringify(err));
})

app.listen(5000,()=>console.log('Express Server is running at 5000'));

//Upload to Google Drive
app.post("/upload", upload.single("file"), (req, res, next) => {
    const stream = require("stream");
    // const serviceAccount = 'PATH TO SERVICE ACCOUNT';
    let fileObject = req.file;
    let bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);
    let filename = req.file.originalname;
    let sqlInsert="INSERT INTO documents (docs ,officer_fk ) VALUES (?,?);"
    
  mysqlConnection.query(sqlInsert,[filename,1],function(err,result){
    if(err)
    {
      console.error(err);
     
     
    }
});


    google
      .drive({ version: "v3", auth: oauth2Client })
      .files.create({
        auth: oauth2Client,
        media: {
          mimeType: "application/pdf",
          body: bufferStream,
        },
        resource: {
          name: filename,
          // if you want to store the file in the root, remove this parents
        },
        fields: "id",
      })
      .then(function (resp) {
        console.log(resp, "resp");
      })
      .catch(function (error) {
        console.log(error);
      });
    res.send("File uploaded");
  });
  
app.get('/admin',(req,res)=>{
    mysqlConnection.query('SELECT * FROM ADMIN',(err,rows,fields)=>
    {
        if(!err)
        res.send(rows); 
        else
        console.log(err);
    })
});


app.delete('/admin/:id',(req,res)=>{
    mysqlConnection.query('DELETE FROM ADMIN WHERE id=?',[req.params.id],(err,rows,fields)=>
    {
        if(!err)
        res.send("Deleter Succesfully"); 
        else
        console.log(err);
    })
});

app.post('/admin',function(req,res){
    //mysql query
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password; 
    let sqlInsert="INSERT INTO admin (username ,email , password) VALUES (?,?,?);"
    let insertedId;
  mysqlConnection.query(sqlInsert,[username,email,password],function(err,result){
    if(err)
    {
      console.error(err);
      return;
     
    }
      
      res.status(200).send(result);
            
    });
})

app.post('/admin/login',function(req,res)
{
    //mysql query 
  
    const email = req.body.email;
    const password = req.body.password; 
    // let sqlInsert="INSERT INTO admin (email , password) VALUES (?,?);"
    // let insertedId;
  
    mysqlConnection.query("SELECT COUNT(*) AS cnt FROM admin WHERE email = ? " , email , function(err , data)
    {
            if(err){

                console.log(err);
            }   
            else{
                if(data[0].cnt > 0){  
                        // Already exist 
                        mysqlConnection.query("SELECT * FROM admin WHERE email = ? ",[email] , function (err, result)
                        {
                        
                            console.log(result[0].password);
                            if(password==result[0].password)
                            {
                                console.log('Valid Id ');
                                return res.json({msg:"Valid User"});
                            }
                                
                                else
                                {
                                    
                                    return res.status(400).json({password:'Invalid Password'});
                                }
                        });
                        
                }
                else{
                    return res.status(404).json({email:'User not found'});
                                
                    }
            }
                
   });

})


app.get('/supervisordetails',(req,res)=>{
    mysqlConnection.query('SELECT * FROM  SUPERVISOR_TABLE WHERE flag!=1',(err,rows,fields)=>
    {
        if(!err)
        res.send(rows); 
        else
        console.log(err);
    })
});


app.delete('/supervisor/:id',(req,res)=>{
    mysqlConnection.query('DELETE FROM SUPERVISOR_TABLE WHERE id=?',[req.params.id],(err,rows,fields)=>
    {
        if(!err)
        res.send("Delete Succesfully"); 
        else
        console.log(err);
    })
});

app.get('/supervisor/accept/:id',(req,res)=>{
    mysqlConnection.query('Update SUPERVISOR_TABLE set flag = 1 where id= ?',[req.params.id],(err,rows,fields)=>
    {
        if(!err)
        res.send("Succesfully updated"); 
        else
        console.log(err);
    })
});

app.get('/reports',(req,res)=>{
    mysqlConnection.query('SELECT * FROM  DOCUMENTS ',(err,rows,fields)=>
    {
        if(!err)
        res.send(rows); 
        else
        console.log(err);
    })
});


app.delete('/document/:id',(req,res)=>{
    mysqlConnection.query('DELETE FROM DOCUMENTS WHERE id=?',[req.params.id],(err,rows,fields)=>
    {
        if(!err)
        res.send("Delete Succesfully"); 
        else
        console.log(err);
    })
});


app.get('/document/:id',(req,res)=>{
    mysqlConnection.query('SELECT docs FROM DOCUMENTS where id= ?',[req.params.id],(err,result)=>
    {
        if(!err)
        res.send(result); 
        else
        console.log(err);
    })
});



app.get('/officerdetails',(req,res)=>{
    mysqlConnection.query('SELECT * FROM  OFFICER_TABLE WHERE flag!=1',(err,rows,fields)=>
    {
        if(!err)
        res.send(rows); 
        else
        console.log(err);
    })
});
