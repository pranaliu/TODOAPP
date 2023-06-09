const router = require("express").Router();
const Todo = require("../models/Todo");
const { getSharedValue,getSessionSharedValues } = require('./shared');
const util = require('util'); 
const axios = require('axios');  
const {FusionAuthClient} = require('@fusionauth/typescript-client');
// Application ID and user role to match
const targetApplicationId =  process.env.CLIENT_ID;
const fusionAuthURL = process.env.BASE_URL;
const targetUserRole = 'admin';


// routes
router
//FusionAuth API to use for User retrieval : GET /api/user/registration/{userId}/{applicationId}
// Create New Start Page with User API details 
.get('/todo/api/start', async(req, res) => {
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

}) //End of this /todo/api/start


// GET /todos/create - Show the form to create a new todo
// Since Create page does not have any response to bind eith DB, this is empty page to render on keep first in routes
.get('/todo/start', (req, res) => {
    // Find out if  Role is Admin 
   //Retrieve individual user's details
    const sharedValue = getSharedValue();
   // console.log("PRANALI USER Data :" + util.inspect(sharedValue));
   //console.log("PRANALI USER Email is:" + util.inspect(sharedValue['email'])); 

   // Find the object with the matching ID in the nested array
   const matchedApplicationObject = sharedValue.registrations.find(obj => obj.applicationId === targetApplicationId);

   // Extract the username from the matched object
   const username = matchedApplicationObject.username;
   const userid = matchedApplicationObject.id;

   // Extract the roles from the matched object
   const roles = matchedApplicationObject.roles;

   // Check if the targetUserRole exists in the roles array
   const adminRoleExists = roles.includes(targetUserRole);

   // Use util.inspect to inspect the userRole
   const inspectionResult = util.inspect(roles, {
         showHidden: false, // Set to true if you want to see non-enumerable properties
         depth: null, // Set the depth to null to inspect nested objects without limitation
       });

   // Use util.inspect to inspect the Admin User Role, This will yeild True or False
   const adminResult = util.inspect(adminRoleExists, {
         showHidden: false, // Set to true if you want to see non-enumerable properties
         depth: null, // Set the depth to null to inspect nested objects without limitation
       });

    console.log("PRANALI USER Email is:" + util.inspect(sharedValue['email'])); 
    const EmailValue =  util.inspect(sharedValue['email']);
    const userEmail = EmailValue.slice(1, -1);

    console.log("PRANALI USER Active Status is:" + util.inspect(sharedValue['active']));  
    console.log("PRANALI Roles are:" + inspectionResult);
    console.log("PRANALI Admin Role is:" + adminResult);

  // Render admin info and based on that redirect to correct links with if statement in ejs
    res.render('start', {user: sharedValue, AdminUser: adminResult, userEmail : userEmail });
})


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
        console.log("PRANALI requested email is:" + email);
        const todos = await Todo.find({userEmail : email });
        res.render('showall', { todos });
      })

// GET /todos/:id - Show a specific todo  only for Admin show this
   .get('/todo/:id', async (req, res) => {
     //Retrieve individual user's details
   const sharedValue = getSharedValue();

   // Find the object with the matching ID in the nested array
   const matchedApplicationObject = sharedValue.registrations.find(obj => obj.applicationId === targetApplicationId);

   // Extract the username from the matched object
   const username = matchedApplicationObject.username;
   const userid = matchedApplicationObject.id;

   // Extract the roles from the matched object
   const roles = matchedApplicationObject.roles;

   // Check if the targetUserRole exists in the roles array
   const adminRoleExists = roles.includes(targetUserRole);

   // Use util.inspect to inspect the userRole
   const inspectionResult = util.inspect(roles, {
         showHidden: false, // Set to true if you want to see non-enumerable properties
         depth: null, // Set the depth to null to inspect nested objects without limitation
       });

   // Use util.inspect to inspect the Admin User Role, This will yeild True or False
   const adminResult = util.inspect(adminRoleExists, {
         showHidden: false, // Set to true if you want to see non-enumerable properties
         depth: null, // Set the depth to null to inspect nested objects without limitation
       });

  const todo = await Todo.findById(req.params.id);
  res.render('show', { todo,  AdminUser: adminResult });
})

// GET /todos/:id/:userEmail - Show a specific todo  only for Users show this
.get('/todo/:id/:userEmail', async (req, res) => {
          //Retrieve individual user's details
          const sharedValue = getSharedValue();
          console.log("PRANALI USER Data :" + util.inspect(sharedValue));
          console.log("PRANALI USER Email is:" + util.inspect(sharedValue['email'])); 
          const EmailValue =  util.inspect(sharedValue['email']);
          const userEmail = EmailValue.slice(1, -1);
          //Retrieve individual user's details
          // Find the object with the matching ID in the nested array
          const matchedApplicationObject = sharedValue.registrations.find(obj => obj.applicationId === targetApplicationId);
          // Extract the username from the matched object
          const username = matchedApplicationObject.username;
          const userid = matchedApplicationObject.id;
        // Extract the roles from the matched object
          const roles = matchedApplicationObject.roles;
        // Check if the targetUserRole exists in the roles array
          const adminRoleExists = roles.includes(targetUserRole);
        // Use util.inspect to inspect the userRole
          const inspectionResult = util.inspect(roles, {
              showHidden: false, // Set to true if you want to see non-enumerable properties
              depth: null, // Set the depth to null to inspect nested objects without limitation
          });
        // Use util.inspect to inspect the Admin User Role, This will yeild True or False
          const adminResult = util.inspect(adminRoleExists, {
              showHidden: false, // Set to true if you want to see non-enumerable properties
              depth: null, // Set the depth to null to inspect nested objects without limitation
          });

          const todo = await Todo.find(req.params.id, req.params.userEmail);
          res.render('show', { todo, AdminUser: adminResult });
})

// POST /add/todo - Create a new todo
  .post("/add/todo", async (req, res) => {
    //Retrieve individual user's details
    const sharedValue = getSharedValue();
    // console.log("PRANALI USER Data :" + util.inspect(sharedValue));
    //console.log("PRANALI USER Email is:" + util.inspect(sharedValue['email'])); 
    const EmailValue =  util.inspect(sharedValue['email']);
    const userEmail = EmailValue.slice(1, -1);
    console.log("PRANALI Email Value without quotes is:" + userEmail);
    const { title, date, description } = req.body;
    const newTodo = new Todo({   
          userEmail: userEmail,
          title,
          date: new Date(date),
          description,
        });
    await newTodo.save();
    res.redirect('/');
  })

  // POST /add/admin/todo - Create a new todo for admins
  .post("/add/admin/todo", async (req, res) => {
    //Retrieve individual user's details
    const sharedValue = getSharedValue();
    const EmailValue =  util.inspect(sharedValue['email']);
    const userEmail = EmailValue.slice(1, -1);
    const email = req.body.email || userEmail;
    console.log("PRANALI Email Value without quotes is:" + userEmail);
    console.log("PRANALI Email Value from form is:" + req.body.email);
    console.log("PRANALI Email Value to save is:" + email);
    const { title, date, description } = req.body;
    const newTodo = new Todo({   
          userEmail: email,
          title,
          date: new Date(date),
          description,
        });
    await newTodo.save();
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
 // res.redirect('/todo/' + req.params.id);
  res.redirect('/');
})

// POST /todos/:id/delete - Delete a todo
.post('/delete/todo/:id', async (req, res) => {
 // const { title, useremail } = req.params;
  await Todo.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

module.exports = router;