// shared.js
const axios = require('axios');
let sharedVariable;
const sharedSessionValues = {};

// tag::baseURL[]
const fusionAuthURL = process.env.BASE_URL;

async function fetchUserData(access_token) {
const response = await axios.get(fusionAuthURL + '/oauth2/userinfo', { headers: { 'Authorization' : 'Bearer ' + access_token } });
 try {
        if (response.status === 200) {
            return response.data;     
          }  
 } catch (err) {
   console.log(err);
 }
}
 
function setSharedValue(value) {
  sharedVariable = value;
}

function getSharedValue() {
  return sharedVariable;
}

function setSessionSharedValues(key, value) {
  sharedSessionValues[key] = value;
}

function getSessionSharedValues(key) {
  return sharedSessionValues[key];
}

module.exports = {
  setSessionSharedValues,
  getSessionSharedValues,
  setSharedValue,
  getSharedValue,
  fetchUserData
};
