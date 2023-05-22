/*const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
// use when starting application locally
let mongoUrlLocal = "mongodb://admin:password@mongodb:27017";

// use when starting application as docker container
let mongoUrlDocker = "mongodb://admin:password@mongodb:8080";

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
  if (err) throw err;
});

// Database Name
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
}; */

//const mongodb = require('mongodb');
//const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');

//Set ToDo Schema as per requirement
 const TodoSchema =  new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: false }}, 
     {collection : 'TODODB' }
     );
  
  module.exports = new mongoose.model("Todo", TodoSchema);

  //module.exports={MongoClient};
