const { getClient } = require('bottender');
if (process.env.TYPE_RUN == 'ci') process.exit(0);
const client = getClient('messenger');

module.exports = {
  getUserProfile: async function(ctx, userID) {
    if (!userID) return ctx.sendText('userID undefined');
    try {
      const user = await client.getUserProfile(userID);
      return ctx.sendText(JSON.stringify(user));
    } catch (e) {
      console.error(e);
      return ctx.sendText('error, check console!');
    }
  },
  markSeen: async function(userID) {
    return await client.markSeen(userID);
  },
  sleep: async function(ms) {
    // eslint-disable-next-line no-undef
    return new Promise((res) => setTimeout(res, ms));
  },
};
