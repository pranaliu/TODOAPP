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

//Redirect URI
const redirectURI = encodeURI('http://localhost:3000/oauth-callback');
const scopes = encodeURIComponent('profile offline_access openid');

// Crypto variables
const password = 'setec-astronomy'
const key = crypto.scryptSync(password, 'salt', 24);
const iv = crypto.randomBytes(16);


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

  //Token Check
  router.get('/tokencheck', async (req, res, next) => {
    const accessToken = req.cookies.access_token;
  
    const active = await common.validateToken(accessToken, clientId, clientId, issuer);
  
    res.render('index', {title: 'FusionAuth Example', active: active});
  });

 //Login link
 router.get('/login', (req, res, next) => {
  const state = generateAndSaveState(req, res);
  const codeChallenge = generateAndSaveCodeChallenge(req, res);
  const nonce = generateAndSaveNonce(req, res);
  res.redirect(302,
               fusionAuthURL + '/oauth2/authorize?' +
                 `client_id=${clientId}&` +
                 `redirect_uri=${redirectURI}&` +
                 `state=${state}&` +
                 `response_type=code&` +
                 `scope=${scopes}&` +
                 `code_challenge=${codeChallenge}&` +
                 `code_challenge_method=S256&` +
                 `nonce=${nonce}`);
}); 

router.get('/oauth-callback', (req, res, next) => {
  // Verify the state
  const reqState = req.query.state;
  const state = restoreState(req, res);
  if (reqState !== state) {
    res.redirect(302,"/"); // Start over
    return;
  }
  
  const code = req.query.code;
  const codeVerifier = restoreCodeVerifier(req, res);
  const nonce = restoreNonce(req, res);

  // POST request to Token endpoint
  const form = new FormData();
  form.append('client_id', clientId);
  form.append('client_secret', clientSecret)
  form.append('code', code);
  form.append('code_verifier', codeVerifier);
  form.append('grant_type', 'authorization_code');
  form.append('redirect_uri', redirectURI);
  axios.post(fusionAuthURL +'/oauth2/token', form, { headers: form.getHeaders() })
    .then((response) => {
      const accessToken = response.data.access_token;
      const idToken = response.data.id_token;
      const refreshToken = response.data.refresh_token;

      // Parse and verify the ID token (it's a JWT and once verified we can just store the body)
      if (idToken) {
        let user = common.parseJWT(idToken, nonce);
          if (!user) {
            console.log('Nonce is bad. It should be ' + nonce + ' but was ' + idToken.nonce);
            res.redirect(302,"/"); // Start over
            return;
          }
        // TODO store user object in localstorage?
      }


      // Since the different OAuth modes handle the tokens differently, we are going to
      // put a placeholder function here. We'll discuss this function in the following
      // sections
      handleTokens(accessToken, idToken, refreshToken, res);
    }).catch((err) => {console.log("in error2"); console.error(JSON.stringify(err));});
});
  
//Token related functions
// Helper method for Base 64 encoding that is URL safe
function base64URLEncode(str) {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(buffer) {
  return crypto.createHash('sha256')
    .update(buffer)
    .digest();
}

function encrypt(value) {
  const cipher = crypto.createCipheriv('aes-192-cbc', key, iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted + ':' + iv.toString('hex');
}

function decrypt(value) {
  const parts = value.split(':');
  const cipherText = parts[0];
  const iv = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv);
  let decrypted = decipher.update(cipherText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function generateAndSaveState(req, res) {
  const state = base64URLEncode(crypto.randomBytes(64));
  res.cookie('oauth_state', encrypt(state), {httpOnly: true});
  return state;
}

function generateAndSaveCodeChallenge(req, res) {
  const codeVerifier = base64URLEncode(crypto.randomBytes(64));
  res.cookie('oauth_code_verifier', encrypt(codeVerifier), {httpOnly: true});
  return base64URLEncode(sha256(codeVerifier));
}

function generateAndSaveNonce(req, res) {
  const nonce = base64URLEncode(crypto.randomBytes(64));
  res.cookie('oauth_nonce', encrypt(nonce), {httpOnly: true});
  return nonce;
}

function restoreState(req, res) {
  const value = decrypt(req.cookies.oauth_state);
  res.clearCookie('oauth_state');
  return value;
}

function restoreCodeVerifier(req, res) {
  const value = decrypt(req.cookies.oauth_code_verifier);
  res.clearCookie('oauth_code_verifier');
  return value;
}

function restoreNonce(req, res) {
  const value = decrypt(req.cookies.oauth_nonce);
  res.clearCookie('oauth_nonce');
  return value;
}

function handleTokens(accessToken, idToken, refreshToken, res) {

  // Write the tokens as cookies
  res.cookie('access_token', accessToken, {httpOnly: true, secure: true});
  res.cookie('id_token', idToken); // Not httpOnly or secure
  res.cookie('refresh_token', refreshToken, {httpOnly: true, secure: true});


  // Call the third-party API
/* this is fake, but you could replace with a real one
  axios.post('https://api.third-party-provider.com/profile/friends', form, { headers: { 'Authorization' : 'Bearer '+accessToken } })
    .then((response) => { 
      if (response.status == 200) {
        const json = JSON.parse(response.data);
        req.session.friends = json.friends;

        // Optionally store the friends list in our database
        storeFriends(req, json.friends);
      }
    });
*/

  // Redirect to the index page
  res.redirect(302, '/');

}

function removeTokens(res) {
  // remove the token cookies
  res.cookie('access_token', null, {httpOnly: true, secure: true});
  res.cookie('id_token', null); 
  res.cookie('refresh_token', null, {httpOnly: true, secure: true});
}


module.exports = router;
