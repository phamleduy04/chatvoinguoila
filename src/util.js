/* eslint-disable prettier/prettier */
const logPath = './log/log.txt'
module.exports = {
  logging: function (text) {
    if (!text) return;
    const moment = require('moment-timezone');
    const { writeFileSync } = require('fs');
    const timenow = moment().tz(process.env.TIMEZONE || 'America/Chicago').format('lll');
    writeFileSync(logPath, `\n${timenow} || ${text}`);
  },
  exportLog: async function(){
    const { VultrexHaste } = require('vultrex.haste');
    const haste = new VultrexHaste({ url: "https://hasteb.in" });
    const { readFileSync } = require('fs');
    const data = readFileSync(logPath, 'utf-8');
    try {
      let url = await haste.post(data)
      return url;
    }
    catch(err) {
      console.log(err);
    }
  }
};
