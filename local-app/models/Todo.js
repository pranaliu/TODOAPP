const mongoose = require('mongoose');

//Set ToDo Schema as per requirement
 const TodoSchema =  new mongoose.Schema({
  //user specification user UUID connect with Users collection
    userEmail : {type: String, required: false},
    title: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: false }}, 
     {collection : 'TODODB' }
     );
  
  module.exports = new mongoose.model("Todo", TodoSchema);

