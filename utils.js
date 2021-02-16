const { getClient } = require('bottender');

const client = getClient('messenger');

module.exports = {
  getUserProfile: function (userID) {
    if (!userID) return 'not found';
    try {
      client.getUserProfile(userID).then((user) => {
        console.log(user);
        return user;
      });
    } catch (e) {
      console.error(e);
      return 'not found';
    }
  },
};
