const router = require("express").Router();
const Todo = require("../models/Todo");
const { getSharedValue } = require('./shared');
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
  console.log("PRANALI USER ID is :" + util.inspect(sharedValue['id']));
  console.log("PRANALI Application ID:" + targetApplicationId); 
  const userId = util.inspect(sharedValue['id']);
 //Call User Retrieval API for getting required details 
 // Use the params for API to call the Fusion Auth API and get User Role 
 // Generate authentication token and save before using it to validate user
 /* PRANALI Comment below code for now
  const data = {
      "generateAuthenticationToken": true,
      "registration": {
        "applicationId": targetApplicationId ,
        "data": {
          "displayName": "Pranali",
         
        },
        "id": userId,
        "username": "pranalitiecon@gmail.com"
      }
    };

    //await axios.put (`${fusionAuthURL}/api/user/registration`, data).then(response => {
router.patch(`/api/user/registration`, data,  function (req, res, next) {
  res.send('PATCH request successful');
  console.log('PRANALI Response:', res.data);
});

 // Then check authentication generated token for further use if needed.
  await axios.get(`${fusionAuthURL}/${userId}/${targetApplicationId}`)
                .then(res => {
                                console.log('Status Code:', res.status);
                                const userData = userResponse.data;
                                console.log("FusionAuth API response is:"+ util.inspect(userData) );

    
                              })
                .catch(err => {
                                  console.log('Error: ', err.message);
                              });          
  
 // console.log("FusionAuth API response is:"+ util.inspect(userData) );
 */
// Check if User info is retrieved at basic level
// GET /api/user/{userId}
router.get('/api/user/${userId}', function (req, res, next) {
  res.send('get request successful');
  console.log("PRANALI response is:" + res.json);
  

});

router.get('/oauth2/userinfo').then((res) => {
  rconsole.log("PRANALI Oauth2 userinfo Response is:"+ res.json);
}).catch((err) => {console.log("PRANALI in error"); console.error(JSON.stringify(err));});





// Render admin info and based on that redirect to correct links with if statement in ejs
  //res.render('start', {user: sharedValue });

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

       //Retrieve individual user's details
      // const sharedValue = getSharedValue();
      // console.log("PRANALI USER Data :" + util.inspect(sharedValue));
    console.log("PRANALI USER Email is:" + util.inspect(sharedValue['email'])); 
    const EmailValue =  util.inspect(sharedValue['email']);
    const userEmail = EmailValue.slice(1, -1);

    console.log("PRANALI USER Active Status is:" + util.inspect(sharedValue['active']));  
   //console.log("PRANALI Application matched username :" + util.inspect(username));
   //console.log("PRANALI Application matched userid :"+ util.inspect(userid));
   //console.log("PRANALI Roles1 are:" + util.inspect(roles));
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