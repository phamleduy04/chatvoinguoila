const { getClient } = require('bottender');

const client = getClient('messenger');

module.exports = {
  getUserProfile: function (userID) {
    if (!userID) return null;
    try {
      client.getUserProfile(userID).then((user) => {
        return user;
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  },
};
