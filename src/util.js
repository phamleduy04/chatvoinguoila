/* eslint-disable prettier/prettier */
module.exports = {
  logging: function (text) {
    if (!text) return;
    const moment = require('moment-timezone');
    const timenow = moment().tz(process.env.TIMEZONE || 'America/Chicago').format('lll');
    console.log(`${timenow} || ${text}`);
  },
};
