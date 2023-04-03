require('dotenv').config();


const connect = require('./config/connect')


const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

//error handler
const errorHandler = require('./middleware/errorHandler')


//for userRouter
const userRouter = require('./routes/userRouter');
app.use('/',userRouter);

//for adminRouter
const adminRouter = require('./routes/adminRouter');
app.use('/admin',adminRouter);

// for view engine 
app.set('view engine','ejs');

const path = require ('path');
app.use(express.static(path.join(__dirname,'public')))


app.use(errorHandler.errorHandler);
//server port
app.listen(3000,function(){
    console.log("server running....");
});

