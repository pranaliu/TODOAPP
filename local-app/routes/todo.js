const router = require("express").Router();
const Todo = require("../models/Todo");
const { getSharedValue,getSessionSharedValues, fetchUserData } = require('./shared');
const util = require('util'); 
const axios = require('axios');  
const {FusionAuthClient} = require('@fusionauth/typescript-client');
// Application ID and user role to match
const targetApplicationId =  process.env.CLIENT_ID;
const fusionAuthURL = process.env.BASE_URL;
const targetUserRole = 'admin';


// routes
router
//FusionAuth API to use for User retrieval : GET /oauth2/userinfo
// Create New Start Page with User API details 
// GET /todos/create - Show the form to create a new todo
// Since Create page does not have any response to bind eith DB, this is empty page to render on keep first in routes

.get('/todo/api/start', async(req, res) => {
  // Find out if  Role is Admin 
  //Retrieve individual user's details
  const access_token = getSessionSharedValues('access_token');
  const user = getSessionSharedValues('user');
  let adminRoleExists;
  let userEmail = "";
  // Call Share function for use retreival
  let userData = fetchUserData(access_token)
  // console.log(userData); // Promise { <pending> }
  userData.then(function(udata) {
      console.log("From share user data plain is:"+ (udata));
      console.log("From share user data is:"+ util.inspect(udata));
      let Roles = udata.roles;
      console.log("From share user data role is:"+ Roles);
      adminRoleExists = Roles.includes(targetUserRole); 
      userEmail = udata.email;
      console.log("PRANALI User Email is:"+ userEmail);
      console.log("PRANALI Admin user value is:" + adminRoleExists);
  // Render admin info and based on that redirect to correct links with if statement in ejs
  res.render('start', {user: user, AdminUser: adminRoleExists, userEmail : userEmail });
})     
}) //End of this /todo/api/start

.get('/todo/start', async(req, res) => {
  // Find out if  Role is Admin 
  //Retrieve individual user's details
  const sharedValue = getSharedValue();
  const access_token = getSessionSharedValues('access_token');
  const user = getSessionSharedValues('user');
  let adminRoleExists;
  console.log("PRANALI USER ID is :" + getSessionSharedValues('user'));
  console.log("PRANALI Application ID:" + targetApplicationId); 
  console.log("PRANALI Access token is:" + access_token);
  const userId = util.inspect(sharedValue['id']);
  let userEmail = "";
 const response = await axios.get(fusionAuthURL + '/oauth2/userinfo', { headers: { 'Authorization' : 'Bearer ' + access_token } });
 try {
        if (response.status === 200) {
            console.log("PRANALI USER INFO DATA IS:"+ util.inspect(response.data));
            const userData = response.data;
           // const juserData = JSON.parse(response.data);
            console.log("PRANALI USER INFO DATA with plain:"+ response.data);
            userEmail = userData.email;
           // console.log("PRANALI email Value with json parse is :" + userEmail);
            console.log("PRANALI email is:" + userEmail );
            // Check if the targetUserRole exists in the roles array
            let Roles = userData.roles;
            adminRoleExists = Roles.includes(targetUserRole);
            console.log("PRANALI User Role is:"+ util.inspect(userData.roles))
            Roles.forEach((element) => {
              console.log("PRANALI Role is: "+ element);
            });
            console.log("PRANALI Admin user value is:"+ adminRoleExists);
   }
 } catch (err) {
   console.log(err);
 }
  
// Render admin info and based on that redirect to correct links with if statement in ejs
  res.render('start', {user: user, AdminUser: adminRoleExists, userEmail : userEmail });

}) //End of this /todo/start

.get('/todo/create', (req, res) => {
  res.render('create');
})

.get('/todo/admin/create', (req, res) => {
  res.render('admincreate');
})

// GET /get/todo - List all todos only for Admin show this
.get('/get/todo', async (req, res) => {
  const todos = await Todo.find();
  res.render('showall', { todos });
}) 

// GET /get/todo/:userEmail - List all todos only for Users show this
.get('/get/todo/:userEmail', async (req, res) => {
  email = req.params.userEmail;
  //console.log("PRANALI requested email is:" + email);
  const todos = await Todo.find({userEmail : email });
  res.render('showall', { todos });
})

// GET /todos/:id - Show a specific todo  only for Admin show this
.get('/todo/:id', async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  //Retrieve individual user's details
  const access_token = getSessionSharedValues('access_token');
  const user = getSessionSharedValues('user');
  let adminRoleExists;
  let userEmail = "";
  // Call Share function for use retreival
  let userData = fetchUserData(access_token)
  // console.log(userData); // Promise { <pending> }
  userData.then(function(udata) {
      console.log("From share user data plain is:"+ (udata));
      console.log("From share user data is:"+ util.inspect(udata));
      let Roles = udata.roles;
      console.log("From share user data role is:"+ Roles);
      adminRoleExists = Roles.includes(targetUserRole); 
      userEmail = udata.email;
      console.log("PRANALI User Email is:"+ userEmail);
      console.log("PRANALI Admin user value is:" + adminRoleExists);
  res.render('show', { todo,  AdminUser: adminRoleExists });
})
})

// GET /todos/:id/:userEmail - Show a specific todo  only for Users show this
.get('/todo/:id/:userEmail', async (req, res) => {
  const todo = await Todo.find(req.params.id, req.params.userEmail);
  //Retrieve individual user's details
  const access_token = getSessionSharedValues('access_token');
  const user = getSessionSharedValues('user');
  let adminRoleExists;
  let userEmail = "";
  // Call Share function for use retreival
  let userData = fetchUserData(access_token)
  // console.log(userData); // Promise { <pending> }
  userData.then(function(udata) {
      console.log("From share user data plain is:"+ (udata));
      console.log("From share user data is:"+ util.inspect(udata));
      let Roles = udata.roles;
      console.log("From share user data role is:"+ Roles);
      adminRoleExists = Roles.includes(targetUserRole); 
      userEmail = udata.email;
      console.log("PRANALI User Email is:"+ userEmail);
      console.log("PRANALI Admin user value is:" + adminRoleExists);
  res.render('show', { todo,  AdminUser: adminRoleExists });
})
})

// POST /add/todo - Create a new todo
.post("/add/todo",  (req, res) => {
//Retrieve individual user's details
const access_token = getSessionSharedValues('access_token');
  const user = getSessionSharedValues('user');
  let adminRoleExists;
  let userEmail = "";
  let email;
  // Call Share function for use retreival
  let userData = fetchUserData(access_token)
  // console.log(userData); // Promise { <pending> }
  userData.then(function(udata) {
      console.log("From share user data plain is:"+ (udata));
      console.log("From share user data is:"+ util.inspect(udata));
      let Roles = udata.roles;
      console.log("From share user data role is:"+ Roles);
      adminRoleExists = Roles.includes(targetUserRole); 
      userEmail = udata.email;
      console.log("PRANALI ADD USER User Email is:"+ userEmail);
      console.log("PRANALI Admin user value is:" + adminRoleExists);
      console.log("PRANALI ADD USER Email Value to save is:" + email);
      console.log("PRANALI Email for Add user is:" + userEmail);
  const {  title, date, description } = req.body;
          const newTodo = new Todo({   
                  userEmail: userEmail,
                  title,
                  date: new Date(date),
                  description,
                });
 newTodo.save();
});
res.redirect('/');
})

// POST /add/admin/todo - Create a new todo for admins
//.post("/add/admin/todo", async (req, res) => {
.post("/add/admin/todo",  (req, res) => {
//Retrieve individual user's details
  const access_token = getSessionSharedValues('access_token');
  const user = getSessionSharedValues('user');
  let adminRoleExists;
  let userEmail = "";
  let email;
  // Call Share function for use retreival
  let userData = fetchUserData(access_token)
  // console.log(userData); // Promise { <pending> }
  userData.then(function(udata) {
      console.log("From share user data plain is:"+ (udata));
      console.log("From share user data is:"+ util.inspect(udata));
      let Roles = udata.roles;
      console.log("From share user data role is:"+ Roles);
      adminRoleExists = Roles.includes(targetUserRole); 
      userEmail = udata.email;
      console.log("PRANALI ADD ADMIN User Email is:"+ userEmail);
      console.log("PRANALI Admin user value is:" + adminRoleExists);
      email = req.body.email || userEmail;     
      console.log("PRANALI ADD ADMIN Email Value to save is:" + email);
      
const { title, date, description } = req.body;
const newTodo = new Todo({   
                      userEmail: email,
                      title,
                      date: new Date(date),
                      description,
                    });
 newTodo.save();
})
res.redirect('/');
})


// GET /todos/:id/edit - Show the form to edit a todo
.get('/edit/todo/:id', async (req, res) => {
const todo = await Todo.findById(req.params.id);
res.render('edit', { todo });
})

// GET /todos/admin/:id/edit - Show the form to edit a todo for admin
.get('/edit/admin/todo/:id', async (req, res) => {
const todo = await Todo.findById(req.params.id);
res.render('adminedit', { todo });
})

// POST /todos/:id - Update a todo
.post('/todo/:id', async (req, res) => {
const { userEmail, title, date, description } = req.body;
await Todo.findByIdAndUpdate(req.params.id, {
            userEmail,
            title,
            date: new Date(date),
            description,
          });
res.redirect('/');
})

// POST /todos/:id/delete - Delete a todo
.post('/delete/todo/:id', async (req, res) => {
await Todo.findByIdAndDelete(req.params.id);
res.redirect('/');
});

module.exports = router;