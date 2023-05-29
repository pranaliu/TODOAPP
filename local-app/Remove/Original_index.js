const router = require("express").Router();
const { FindOperators, FindCursor } = require("mongodb");
const Todo = require("../models/Todo");
const {FusionAuthClient} = require('@fusionauth/typescript-client');
const { setSharedValue } = require('./shared');
const util = require('util');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
const common = require('./common');

// tag::clientIdSecret[]
// set in the environment or directly
const clientId = process.env.CLIENT_ID; // or set directly
const clientSecret = process.env.CLIENT_SECRET; // or set directly
// end::clientIdSecret[]

// tag::baseURL[]
const fusionAuthURL = process.env.BASE_URL;
// end::baseURL[]
const issuer = process.env.ISSUER;

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

router.get("/", async (req, res) => {
    const allTodo = await Todo.find().sort({ date: 'desc' });
    res.render("index", { allTodo });
  });

module.exports = router;
