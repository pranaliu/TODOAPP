const axios = require('axios');
const FormData = require('form-data');
const { promisify } = require('util');

const common = {};
// tag::clientIdSecret[]
// set in the environment or directly
const clientId = process.env.CLIENT_ID; // or set directly
const clientSecret = process.env.CLIENT_SECRET; // or set directly
// end::clientIdSecret[]

// tag::baseURL and issuer[]
const authServerUrl = process.env.BASE_URL;
const issuer = process.env.ISSUER;
// end::baseURL[]


const jwksUri = authServerUrl+'/.well-known/jwks.json';

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const client = jwksClient({
  strictSsl: true, // Default value
  jwksUri: jwksUri,
  requestHeaders: {}, // Optional
  requestAgentOptions: {}, // Optional
  timeout: 30000, // Defaults to 30s
});

common.parseJWT = async (unverifiedToken, nonce) => {
  const parsedJWT = jwt.decode(unverifiedToken, {complete: true});
  const getSigningKey = promisify(client.getSigningKey).bind(client);
  let signingKey = await getSigningKey(parsedJWT.header.kid);
  let publicKey = signingKey.getPublicKey();
  try {
    const token = jwt.verify(unverifiedToken, publicKey, { audience: clientId, issuer: issuer });
    if (nonce) {
      if (nonce !== token.nonce) {
        console.log("nonce doesn't match "+nonce +", "+token.nonce);
        return null;
      }
    }
    return token; // Token can be stored in session
  } catch(err) {
    console.log(err);
    throw err;
  }
}

common.refreshJWTs = async (refreshToken) => {
  console.log("refreshing.");
  // POST refresh request to Token endpoint
  const form = new FormData();
  form.append('client_id', clientId);
  form.append('grant_type', 'refresh_token');
  form.append('refresh_token', refreshToken);
  const authValue = 'Basic ' + Buffer.from(clientId +":"+clientSecret).toString('base64');
  const response = await axios.post(authServerUrl+'/oauth2/token', form, { 
      headers: { 
         'Authorization' : authValue,
         ...form.getHeaders()
      } });

  const accessToken = response.data.access_token;
  const idToken = response.data.id_token;
  const refreshedTokens = {};
  refreshedTokens.accessToken = accessToken;
  refreshedTokens.idToken = idToken;
  return refreshedTokens;
}

common.validateToken = async function (accessToken, clientId, expectedAud, expectedIss) {

  const form = new FormData();
  form.append('token', accessToken);
  form.append('client_id', clientId); // FusionAuth requires this for authentication
 
  try {
    const response = await axios.post(authServerUrl+'/oauth2/introspect', form, { headers: form.getHeaders() });
    if (response.status === 200) {
      const data = response.data;
      if (!data.active) {
        return false; // if not active, we don't get any other claims
      }
      return expectedAud === data.aud && expectedIss === data.iss;
    }
  } catch (err) {
    console.log(err);
  }

  return false;
}

common.retrieveUser = async function (accessToken) {
  const response = await axios.get(authServerUrl + '/oauth2/userinfo', { headers: { 'Authorization' : 'Bearer ' + accessToken } });
  try {
    if (response.status === 200) {
      return response.data;
    }
   // return null;
  } catch (err) {
    console.log(err);
  }
  //return null;
}

common.authorizationCheck = async (req, res) => {
  const accessToken = req.session.access_token;
  if (!accessToken) {
    return false;
  }

  try {
    let jwt = await common.parseJWT(accessToken);
    return true;
  } catch (err) { 
    console.log(err);
    return false;
  }
}

module.exports = common;