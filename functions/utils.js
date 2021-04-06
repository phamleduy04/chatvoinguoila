const { getClient } = require('bottender');
const { TIMEZONE, TYPE_RUN } = process.env;
if (TYPE_RUN == 'ci') process.exit(0);
const client = getClient('messenger');
const { badWords, badPhrase } = require('../assets/blacklistWords.json');
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
    return new Promise((res) => setTimeout(res, ms));
  },
  sendAgain: async function(userid, content) {
    await module.exports.sleep(5000);
    return await client.sendMessage(userid, { text: content });
  },
  logging: function(text) {
    if (!text) return;
    const moment = require('moment-timezone');
    const timenow = moment()
      .tz(TIMEZONE || 'America/Chicago')
      .format('lll');
    const string = `${timenow} || ${text}`;
    logArr.push(string);
    console.log(string);
  },
  checkBadWord: function(string) {
    for (let i = 0; i < badWords.length; i++) {
        const badword = badWords[i];
        if (string.toLowerCase().split(' ').includes(badword)) return true;
    }
    for (let i = 0; i < badPhrase.length; i++) {
      const badphrase = badPhrase[i];
      if (string.includes(badphrase)) return true;
    }
    return false;
  },
  badWordWarning: async function(userid) {
    await client.sendButtonTemplate(userid, '[SYSTEM] Bot vừa phát hiện từ nằm trong danh sách blacklist!\nNếu người bên kia đang quấy rối bạn, bạn hãy nhấn nút "Report" ở dưới, sau đó exit!\nNếu không bạn có thể bỏ qua tin nhắn này!', [
      {
        type: 'postback',
        title: 'Report',
        payload: 'REPORT',
      },
    ]);
  },
  sendOwner: async function(content) {
    if (!process.env.OWNERID) return;
    return await client.sendText(process.env.OWNERID, content);
  },
};
