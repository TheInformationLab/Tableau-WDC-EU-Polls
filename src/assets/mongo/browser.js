const {
  Stitch,
  // RemoteMongoClient,
  AnonymousCredential,
} = require('mongodb-stitch-browser-sdk');

const client = Stitch.initializeDefaultAppClient('til-wdc-dev-fwbxx');

// const mongodb = client.getServiceClient(
//   RemoteMongoClient.factory,
//   'til-wdcs',
// );
// const db = mongodb.db('til-wdc-stats');

const auth = () => new Promise((resolve, reject) => {
  if (client.auth.isLoggedIn) {
    resolve();
  } else {
    client.auth
      .loginWithCredential(new AnonymousCredential())
      .then(resolve)
      .catch(reject);
  }
});

const recordStat = (wdc, action) => new Promise((resolve, reject) => auth()
  .then(() => client.callFunction('recordWdcStatistic', [wdc, action]))
  .then((result) => {
    resolve(result);
  })
  .catch(reject));

const getCountries = () => new Promise((resolve, reject) => auth()
  .then(() => client.callFunction('euPollofPollsGetCountries'))
  .then((result) => {
    resolve(result);
  })
  .catch(reject));

const getPoll = poll => new Promise((resolve, reject) => auth()
  .then(() => client.callFunction('euPollofPollsGetPoll', [poll]))
  .then((result) => {
    resolve(result);
  })
  .catch(reject));

module.exports = {
  recordStat,
  getCountries,
  getPoll,
};
