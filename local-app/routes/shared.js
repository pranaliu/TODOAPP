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
           // const userData = response.data;
           // console.log("PRANALI USER INFO DATA with plain:"+ response.data);
           // const userEmail = userData.email;
           // console.log("PRANALI email is:" + userEmail );
            // Check if the targetUserRole exists in the roles array
           // let Roles = userData.roles;
           // let adminRoleExists = Roles.includes(targetUserRole);
         //   console.log("PRANALI User Role is:"+(userData.roles))
           // Roles.forEach((element) => {
            //  console.log("PRANALI Role is: "+ element);
            //});
           // console.log("PRANALI Admin user value is:"+ adminRoleExists);
            //setSessionSharedValues('userEmail',userEmail);
            //setSessionSharedValues('adminRoleExists',adminRoleExists);
           // return userData ;

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

