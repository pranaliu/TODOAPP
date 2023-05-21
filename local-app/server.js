let express = require('express');
let path = require('path');
let fs = require('fs');
const mongoose = require('mongoose');
let MongoClient = require('mongodb').MongoClient;
let bodyParser = require('body-parser');
let app = express();

//middleware
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

//routes
app.use(require("./routes/index"))
app.use(require("./routes/todo"))


//PRANALI below lines will be taken out once index and todo is set
/* Pranali no need
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
  });

app.get('/profile-picture', function (req, res) {
  let img = fs.readFileSync(path.join(__dirname, "images/docker.jpg"));
  res.writeHead(200, {'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
}); 
*/
//PRANALI block for routes will end here once in place

// use when starting application locally
//let mongoUrlLocal = "mongodb://admin:password@mongodb:27017";
let mongoUrlLocal = "mongodb://admin:password@mongodb:27017";
//mongodb://localhost/todo_express

// use when starting application as docker container
let mongoUrlDocker = "mongodb://admin:password@mongodb:8080";

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// "user-account" in demo with docker. "my-db" in demo with docker-compose
/* PRANALI COMMENT THIS 
let databaseName = "Todo";
*/

/* PRANALI Comment this code
app.post('/update-profile', function (req, res) {
  let userObj = req.body;
  */

/*PRANALI comment below
  MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
    if (err) throw err;
  });
*/
  // conenction to mongodb
mongoose.connect(mongoUrlLocal, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Database Name
/* PRANALI Comment this
const dbName = 'TodoSchema';

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

  const db = client.db(dbName);

  createValidated(db, function() {
    client.close();
  });
});


function createValidated(db, callback) {
  db.createCollection("Todo", 
	   {
	      'validator': { '$or':
	         [
	            { 'title': { '$type': "string", '$required': true } },
	            { 'date': { '$type': "date", '$required': true } },
	            { 'description': { '$type': "string", '$required': true } }
	         ]
	      }
	   },
    function(err, results) {
      console.log("Collection created.");
      callback();
    }
  );
};
*/

//PRANALI comment below code
/*
    let db = client.db(databaseName);
    userObj['userid'] = 1;

    let myquery = { userid: 1 };
    let newvalues = { $set: userObj };

    db.collection("todoItems").updateOne(myquery, newvalues, {upsert: true}, function(err, res) {
      if (err) throw err;
      client.close();
    });
*/

  // Send response
  //PRANALI comment below code
  //res.send(userObj);
//});

//PRANALI comment below code
/*
app.get('/get-profile', function (req, res) {
  let response = {};
  // Connect to the db
  MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
    if (err) throw err;

    let db = client.db(databaseName);

    let myquery = { userid: 1 };

    db.collection("users").findOne(myquery, function (err, result) {
      if (err) throw err;
      response = result;
      client.close();

      // Send response
      res.send(response ? response : {});
    });
  });
});
*/

app.listen(3000, function () {
  console.log("app listening on port 3000!");
});
