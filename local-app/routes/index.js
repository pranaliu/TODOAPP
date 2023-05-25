const router = require("express").Router();
const { FindOperators, FindCursor } = require("mongodb");
const Todo = require("../models/Todo");
const {FusionAuthClient} = require('@fusionauth/typescript-client');
const { setSharedValue } = require('./shared');
const util = require('util');

// tag::clientIdSecret[]
// set in the environment or directly
const clientId = process.env.CLIENT_ID; // or set directly
const clientSecret = process.env.CLIENT_SECRET; // or set directly
// end::clientIdSecret[]

// tag::baseURL[]
const fusionAuthURL = process.env.BASE_URL;
// end::baseURL[]

const client = new FusionAuthClient('noapikeyneeded', fusionAuthURL);
const pkceChallenge = require('pkce-challenge');

// routes will be here...

// tag::logoutRoute[]
/* logout page. */
router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.redirect(302, '/');
});
// end::logoutRoute[]

/* GET home page. */
router.get('/', function (req, res, next) {
  const stateValue = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  req.session.stateValue = stateValue;

  //generate the pkce challenge/verifier dict
  const pkce_pair = pkceChallenge.default();
  // Store the PKCE verifier in session
  req.session.verifier = pkce_pair['code_verifier'];
  const challenge = pkce_pair['code_challenge'];


  const user = req.session.user;
  //Store user value to reuse with todo API's
  setSharedValue(user);

  //const userData  = util.inspect(user);
  //console.log("PRANALI We are checking user session data with index.js is:"+ util.inspect(req.session.user) );
  //console.log("PRANALI We are checking user data with index.js is:"+  userData);
  //const targetApplicationId =  clientId;
  //const targetUserRole = 'admin';

  // Find the object with the matching ID in the nested array
  //const matchedApplicationObject = userData.registrations.find(obj => obj.applicationId === targetApplicationId);

  // Extract the username from the matched object
  //const username = matchedApplicationObject.username;
  //const userid = matchedApplicationObject.id;

  // Extract the roles from the matched object
  //const roles = matchedApplicationObject.roles;

  // Check if the targetUserRole exists in the roles array
  //const adminRoleExists = roles.includes(targetUserRole);

  // Use util.inspect to inspect the userRole
  //const inspectionResult = util.inspect(roles, {
   //     showHidden: false, // Set to true if you want to see non-enumerable properties
    //    depth: null, // Set the depth to null to inspect nested objects without limitation
     // });

  // Use util.inspect to inspect the Admin User Role, This will yeild True or False
  //const adminResult = util.inspect(adminRoleExists, {
    //    showHidden: false, // Set to true if you want to see non-enumerable properties
      //  depth: null, // Set the depth to null to inspect nested objects without limitation
      //});

 // console.log("PRANALI USER Active Status is:" + util.inspect(user['active']));  
  //console.log("PRANALI Application matched username :" + util.inspect(username));
  //console.log("PRANALI Application matched userid :"+ util.inspect(userid));
  //console.log("PRANALI Roles1 are:" + util.inspect(roles));
 // console.log("PRANALI Roles are:" + inspectionResult);
  //console.log("PRANALI Admin Role is:" + adminResult);

  res.render('index', {user: user, title: 'FusionAuth Example', clientId: clientId, challenge: challenge, stateValue: stateValue, fusionAuthURL: fusionAuthURL});
});

// tag::fullOAuthCodeExchange[]
/* OAuth return from FusionAuth */
router.get('/oauth-redirect', function (req, res, next) {
  const stateFromServer = req.query.state;
  //Store user value to reuse with todo API's
 // setSharedValue(req.session.user);
  if (stateFromServer !== req.session.stateValue) {
    console.log("State doesn't match. uh-oh.");
    console.log("Saw: " + stateFromServer + ", but expected: " + req.session.stateValue);
    res.redirect(302, '/');
    return;
  }

// tag::exchangeOAuthCode[]
  // This code stores the user in a server-side session
 client.exchangeOAuthCodeForAccessTokenUsingPKCE(req.query.code,
                                                 clientId,
                                                 clientSecret,
                                                 'http://localhost:3000/oauth-redirect',
                                                 req.session.verifier)
// end::exchangeOAuthCode[]
      .then((response) => {
        console.log(response.response.access_token);
        return client.retrieveUserUsingJWT(response.response.access_token);
      })
      .then((response) => {
// tag::setUserInSession[]
        req.session.user = response.response.user;
        return response;
      })
// end::setUserInSession[]

// PRANALI Block Below code as it's used for PKCE challenge code
//Use commented lined from below snippet and check
      .then((response) => {
           res.redirect(302, '/');
      }).catch((err) => {console.log("in error"); console.error(JSON.stringify(err));});


});
// end::fullOAuthCodeExchange[]

  // This code can be set in the last promise above to send the access and refresh tokens
  // back to the browser as secure, HTTP-only cookies, an alternative to storing user info in the session
  //     .then((response) => {
  //       res.cookie('access_token', response.response.access_token, {httpOnly: true});
  //       res.cookie('refresh_token', response.response.refresh_token, {httpOnly: true});
  //       res.redirect(302, '/');
  //     }).catch((err) => {console.log("in error"); console.error(JSON.stringify(err));});

router.get("/", async (req, res) => {
    const allTodo = await Todo.find().sort({ date: 'desc' });
    res.render("index", { allTodo });
  });

  

module.exports = router;
