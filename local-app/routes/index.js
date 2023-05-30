const router = require("express").Router();
const { FindOperators, FindCursor } = require("mongodb");
const Todo = require("../models/Todo");
const {FusionAuthClient} = require('@fusionauth/typescript-client');
const util = require('util');

// tag::clientIdSecret[]
// set in the environment or directly
const clientId = process.env.CLIENT_ID; // or set directly
const clientSecret = process.env.CLIENT_SECRET; // or set directly
// end::clientIdSecret[]

// tag::baseURL[]
const fusionAuthURL = process.env.BASE_URL;
// end::baseURL[]
const issuer = process.env.ISSUER;

//Redirect URI
//const redirectURI = encodeURI('http://localhost:3000/oauth-callback');
const redirectURI = "http://localhost:3000/oauth-callback";
const scopes = encodeURIComponent('profile offline_access openid');


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
  const access_token = req.session.access_token;
  const refresh_token = req.session.refresh_token;
  res.render('index', {user: user, access_token: access_token, refresh_token:refresh_token, title: 'FusionAuth Example', clientId: clientId, challenge: challenge, stateValue: stateValue, fusionAuthURL: fusionAuthURL});
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
        req.session.access_token = response.response.access_token;
        req.session.refresh_token = response.response.refresh_token;
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

  //PRANALI Add code from index.js fusion Auth Repo to check on Login in simplicit way
  //refresh token
  router.post('/refresh', async (req, res, next) => {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      res.sendStatus(403);
      return;
    }
    try {
      const refreshedTokens = await common.refreshJWTs(refreshToken);
  
      const newAccessToken = refreshedTokens.accessToken;
      const newIdToken = refreshedTokens.idToken;
    
      // update our cookies
      console.log("updating our cookies");
      res.cookie('access_token', newAccessToken, {httpOnly: true, secure: true});
      res.cookie('id_token', newIdToken); // Not httpOnly or secure
      res.sendStatus(200);
      return;
    } catch (error) {
      console.log("unable to refresh");
      res.sendStatus(403);
      return;
    }
  
  });


 
module.exports = router;