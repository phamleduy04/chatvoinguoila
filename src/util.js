/* eslint-disable prettier/prettier */
const logPath = './log/log.txt'
const { writeFileSync, readFileSync } = require('fs');
module.exports = {
  logging: function (text) {
    if (!text) return;
    const moment = require('moment-timezone');
    const timenow = moment().tz(process.env.TIMEZONE || 'America/Chicago').format('lll');
    const oldData = readFileSync(logPath, 'utf-8');
    const string = `${timenow} || ${text}`
    console.log(string);
    writeFileSync(logPath, `${oldData}\n${string}`);
  },
  exportLog: async function(){
    const { VultrexHaste } = require('vultrex.haste');
    const haste = new VultrexHaste({ url: "https://hasteb.in" });
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
