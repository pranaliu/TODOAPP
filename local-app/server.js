let express = require('express');
let path = require('path');
let fs = require('fs');
const mongoose = require('mongoose');
let MongoClient = require('mongodb').MongoClient;
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var logger = require('morgan');
var dotenv = require('dotenv').config();
let bodyParser = require('body-parser');
let app = express();

//middleware
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
//app.use(express.static("public"));
app.use(cookieParser());
app.use(expressSession({resave: false, saveUninitialized: false, secret: 'fusionauth-node-example'}));
app.use(express.static(path.join(__dirname, 'public')));

//app.engine('html',require('ejs').renderFile);
//app.set('views', path.join(__dirname, 'views'));
app.set('views', __dirname + '/views');
app.set("view engine", "ejs");
app.engine('ejs', require('ejs').__express);
//app.set('view engine', 'html');


//routes
app.use(require("./routes/index"))
app.use(require("./routes/todo"))

// use when starting application locally
//let mongoUrlLocal = "mongodb://admin:password@mongodb:27017";
let mongoUrlLocal = "mongodb://admin:password@mongodb:27017";
//mongodb://localhost/todo_express

// use when starting application as docker container
let mongoUrlDocker = "mongodb://admin:password@mongodb:8080";

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

  // conenction to mongodb
mongoose.connect(mongoUrlLocal, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


app.listen(3000, function () {
  console.log("app listening on port 3000!");
});
