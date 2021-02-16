const { getClient } = require('bottender');

const client = getClient('messenger');

module.exports = {
  getUserProfile: async function (ctx, userID) {
    if (!userID) return ctx.sendText('userID undefined');
    try {
      const user = await client.getUserProfile(userID);
      return ctx.sendText(JSON.stringify(user));
    } catch (e) {
      console.error(e);
      return ctx.sendText('error, check console!');
    }
  },
};
