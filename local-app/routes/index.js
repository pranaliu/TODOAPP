const router = require("express").Router();
const { FindOperators, FindCursor } = require("mongodb");
const Todo = require("../models/Todo");


// routes will be here...

router.get("/", async (req, res) => {
    const todos = await Todo.find().sort({ date: 'desc' });
    res.render("index", { todo: todos });
  });
  

module.exports = router;
