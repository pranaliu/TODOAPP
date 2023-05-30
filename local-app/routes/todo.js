const router = require("express").Router();
const Todo = require("../models/Todo");
const util = require('util'); 
const axios = require('axios');  
const {FusionAuthClient} = require('@fusionauth/typescript-client');
const common = require('./common');
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

.get('/todo/start', async(req, res) => {
  // Find out if  Role is Admin 
  let adminRoleExists;
  let userEmail = "";
  // Call Share function for use retreival
  let userData = common.retrieveUser(req.session.access_token);
  userData.then(function(udata) {
      let Roles = udata.roles;
      adminRoleExists = Roles.includes(targetUserRole); 
      userEmail = udata.email;
  // Render admin info and based on that redirect to correct links with if statement in ejs
  res.render('start', {user: req.session.user, AdminUser: adminRoleExists, userEmail : userEmail });
})     
}) //End of this /todo/start

.get('/todo/create', (req, res) => {
  common.authorizationCheck(req, res).then((authorized) => {
    if (!authorized) {
      res.sendStatus(403); 
      return;
    }
    res.render('create');  
  }).catch((err) => {
    console.log(err);
  });
})

.get('/todo/admin/create', (req, res) => {
  common.authorizationCheck(req, res).then((authorized) => {
    if (!authorized) {
      res.sendStatus(403); 
      return;
    }
    res.render('admincreate');
    //Create your own func
  }).catch((err) => {
    console.log(err);
  });
})

//GET TODO based on authorizaton
router.get('/get/todo',  (req, res) => {
  common.authorizationCheck(req, res).then((authorized) => {
    if (!authorized) {
      res.sendStatus(403); 
      return;
    }
    Todo.find({}).lean().then(result => {
                              const todos = result.map(doc => { 
                              // Exclude unwanted fields from each document and keep only data
                              const { ...data } = doc;
                              return data;
                            }); 
                            // Perform operations on the filtered data
                            res.render('showall', { todos });
                          })
                            .catch(error => {
                            console.error(error);
                          }); 
  }).catch((err) => {
    console.log(err);
  });
})


// GET /get/todo/:userEmail - List all todos only for Users show this
.get('/get/todo/:userEmail',  (req, res) => {
  let email = req.params.userEmail;
  common.authorizationCheck(req, res).then((authorized) => {
    if (!authorized) {
      res.sendStatus(403); 
      return;
    }
    Todo.find({userEmail : email }).lean().then(result => {
                              const todos = result.map(doc => { 
                              // Exclude unwanted fields from each document and keep only data
                              const { ...data } = doc;
                              return data;
                            }); 
                            // Perform operations on the filtered data
                            res.render('showall', { todos });
                          })
                            .catch(error => {
                            console.error(error);
                          }); 
  }).catch((err) => {
    console.log(err);
  });
})

// GET /todo/:id - Show a specific todo  only for Admin show this
.get('/todo/:id',  (req, res) => {
  // Do Authorization Check
  let adminRoleExists;
  let userEmail = "";
  common.authorizationCheck(req, res).then((authorized) => {
    if (!authorized) {
      res.sendStatus(403); 
      return;
    }
  //Find todo data by id
  Todo.findById(req.params.id).lean().then(result => {
      // Exclude unwanted fields from each document and keep only data
      const { connection, schema, ...data } = result;
      const todo = data;
      //Find Admin user 
      let userData = common.retrieveUser(req.session.access_token);
      userData.then(function(udata) {
             let Roles = udata.roles;
                 adminRoleExists = Roles.includes(targetUserRole); 
                 userEmail = udata.email;
                 //Render Results
                  res.render('show', { todo,  AdminUser: adminRoleExists });
     
                }).catch((err) => {
                    console.log(err);
                  });
      }) .catch(error => {
        console.error(error);
    }); //end of todo data DB fetch and Retrieve User Data 
  }) //END OF authentication
}) //END OF TODO/:ID

// GET /todos/:id/:userEmail - Show a specific todo  only for Users show this
.get('/todo/:id/:userEmail',  (req, res) => {
    let adminRoleExists;
    let userEmail = "";
       // Do Authorization Check
    common.authorizationCheck(req, res).then((authorized) => {
      if (!authorized) {
        res.sendStatus(403); 
        return;
      }
    //Find todo data by id
    Todo.find(req.params.id, req.params.userEmail).lean().then(result => {
        // Exclude unwanted fields from each document and keep only data
        const { connection, schema, ...data } = result;
        const todo = data;
        //Find Admin user 
        let userData = common.retrieveUser(req.session.access_token);
        userData.then(function(udata) {
               let Roles = udata.roles;
                   adminRoleExists = Roles.includes(targetUserRole); 
                   userEmail = udata.email;
                   //Render Results
                    res.render('show', { todo,  AdminUser: adminRoleExists });       
                  }).catch((err) => {
                      console.log(err);
                    });
        }) .catch(error => {
          console.error(error);
      }); //end of todo data DB fetch and Retrieve User Data 
    }) //END OF authentication
})

// POST /add/todo - Create a new todo
.post("/add/todo",  (req, res) => {
  let adminRoleExists;
  let userEmail = "";
  let email;
      // Do Authorization Check
  common.authorizationCheck(req, res).then((authorized) => {
    if (!authorized) {
      res.sendStatus(403); 
      return;
    }
    //Retrieve individual user's details
  let userData = common.retrieveUser(req.session.access_token);
  userData.then(function(udata) {
  let Roles = udata.roles;
  adminRoleExists = Roles.includes(targetUserRole); 
  userEmail = udata.email;
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
  }).catch((err) => {
    console.log(err);
  });
})

// POST /add/admin/todo - Create a new todo for admins
.post("/add/admin/todo",  (req, res) => {
//Retrieve individual user's details
  let adminRoleExists;
  let userEmail = "";
  let email;
      // Do Authorization Check
  common.authorizationCheck(req, res).then((authorized) => {
    if (!authorized) {
      res.sendStatus(403); 
      return;
    }
  // Call Share function for use retreival
  let userData = common.retrieveUser(req.session.access_token);
  userData.then(function(udata) {
      let Roles = udata.roles;
      adminRoleExists = Roles.includes(targetUserRole); 
      userEmail = udata.email;
      email = req.body.email || userEmail;     
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
  }).catch((err) => {
    console.log(err);
  });
})

// GET /todos/:id/edit - Show the form to edit a todo
.get('/edit/todo/:id', async (req, res) => {
      // Do Authorization Check
common.authorizationCheck(req, res).then((authorized) => {
  if (!authorized) {
    res.sendStatus(403); 
    return;
  }
    //Find todo data by id
    Todo.findById(req.params.id).lean().then(result => {
      // Exclude unwanted fields from each document and keep only data
      const { connection, schema, ...data } = result;
      const todo = data;
      res.render('edit', { todo });
    }).catch((err) => {
      console.log(err);
    }); //END OF FINDBYID
}).catch((err) => {
  console.log(err);
}); //END OF authorization
}) //END OF GET /todos/:id/edit

// GET /todos/admin/:id/edit - Show the form to edit a todo for admin
.get('/edit/admin/todo/:id', async (req, res) => {
      // Do Authorization Check
  common.authorizationCheck(req, res).then((authorized) => {
    if (!authorized) {
      res.sendStatus(403); 
      return;
    }
    //Find todo data by id
    Todo.findById(req.params.id).lean().then(result => {
      // Exclude unwanted fields from each document and keep only data
      const { connection, schema, ...data } = result;
      const todo = data;
      res.render('adminedit', { todo });
      }).catch((err) => {
      console.log(err);
    }); //END OF FINDBYID
  }).catch((err) => {
  console.log(err);
 }); //END OF authorization
}) //END OF  GET /todos/admin/:id/edit

// POST /todos/:id - Update a todo
.post('/todo/:id',  (req, res) => {
const { userEmail, title, date, description } = req.body;
    // Do Authorization Check
common.authorizationCheck(req, res).then((authorized) => {
  if (!authorized) {
    res.sendStatus(403); 
    return;
  }
  Todo.findByIdAndUpdate(req.params.id, 
                          {
                              userEmail,
                              title,
                              date: new Date(date),
                              description,
                          }, 
                          { new: true })
                          .then(updatedTodo => {
                          res.redirect('/');
                        })
                          .catch(error => {
                            console.error(error);   
                          });
    }).catch((err) => {
      console.log(err);
  }); // END OF authorization
}) // END OF POST /todos/:id 

// POST /todos/:id/delete - Delete a todo
.post('/delete/todo/:id',  (req, res) => {
      // Do Authorization Check
  common.authorizationCheck(req, res).then((authorized) => {
    if (!authorized) {
      res.sendStatus(403); 
      return;
    }
    Todo.findByIdAndDelete(req.params.id)
          .then(deletedTodo => {
            res.redirect('/');
          })
          .catch(error => {
                console.error(error);
                // Handle the error
          });
    }).catch((err) => {
        console.log(err);
  }); // END OF authorization
}); // END OF POST /todos/:id/delete 

module.exports = router;