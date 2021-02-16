const { getClient } = require('bottender');

const client = getClient('messenger');

module.exports = {
  getUserProfile: async function (userID) {
    if (!userID) return 'not found';
    try {
      const user = await client.getUserProfile(userID);
      return JSON.stringify(user);
    } catch (e) {
      console.error(e);
      return 'not found';
    }
  },
};
