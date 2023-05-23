const router = require("express").Router();
const Todo = require("../models/Todo");

// routes
router
// GET /todos/create - Show the form to create a new todo
// Since Create page does not have any response to bind eith DB, this is empty page to render on keep first in routes
.get('/todo/create', (req, res) => {
  res.render('create');
})

// GET /get/todo - List all todos
  .get('/get/todo', async (req, res) => {
    const todos = await Todo.find();
    res.render('showall', { todos });
  }) 

// GET /todos/:id - Show a specific todo
   .get('/todo/:id', async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  res.render('show', { todo });
})



// POST /add/todo - Create a new todo
  .post("/add/todo", async (req, res) => {
    const { title, date, description } = req.body;
    const newTodo = new Todo({   
      title,
      date: new Date(date),
      description, });
      await newTodo.save();
      res.redirect('/');
    })

// GET /todos/:id/edit - Show the form to edit a todo
  .get('/edit/todo/:id', async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  res.render('edit', { todo });
})

// POST /todos/:id - Update a todo
.post('/todo/:id', async (req, res) => {
  const { title, date, description } = req.body;
  await Todo.findByIdAndUpdate(req.params.id, {
    title,
    date: new Date(date),
    description,
  });
 // res.redirect('/todo/' + req.params.id);
 res.redirect('/');
})

// POST /todos/:id/delete - Delete a todo
.post('/delete/todo/:id', async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

  module.exports = router;