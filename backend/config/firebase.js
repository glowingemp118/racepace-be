var admin = require("firebase-admin");

var serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket:'dummy-website-1.appspot.com',
});
const bucket = admin.storage().bucket();
module.exports={ bucket , admin }