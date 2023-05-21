const router = require("express").Router();
const Todo = require("../models/Todo");


// routes will be here....
router.get("/", async(req, res) => {
    const allTodo = await find();
    res.render("index", {title: allTodo})
})


module.exports = router;
