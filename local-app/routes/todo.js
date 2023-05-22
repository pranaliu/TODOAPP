const router = require("express").Router();
const Todo = require("../models/Todo");

// routes
router
  .post("/add/todo", async (req, res) => {
    const { title, date, description } = req.body;
    const newTodo = new Todo({   
      title,
      date: new Date(date),
      description, });
      await newTodo.save();
      res.redirect('/');
    })

   
    // save the todo
    //newTodo
     // .save()
      //.then(() => {
       // console.log("Successfully added todo!");
        //res.redirect("/");
      //})
      //.catch((err) => console.log(err));
  //})



  //.get("/delete/todo/:_id", (req, res) => {
   // const { _id } = req.params;
    //deleteOne({ _id })
     // .then(() => {
      //  console.log("Deleted Todo Successfully!");
       // res.redirect("/");
      //})
      //.catch((err) => console.log(err));
  //});

  // POST /todos/:id/delete - Delete a todo
.post('/delete/todo/:id', async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

  module.exports = router;