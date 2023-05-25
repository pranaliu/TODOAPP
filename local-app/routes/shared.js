// shared.js
let sharedVariable;

function setSharedValue(value) {
  sharedVariable = value;
}

function getSharedValue() {
  return sharedVariable;
}

module.exports = { setSharedValue, getSharedValue };
