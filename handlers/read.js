// Read = When user seen message
const { get } = require('../functions/database');
const { markSeen } = require('../functions/utils');
module.exports = async (ctx) => {
  const id = ctx.event.rawEvent.sender.id;
  const data = await get(id);
  if (!data || !data.target) return;
  try {
    await markSeen(data.target);
  } catch (e) {
    console.log(`Can't mark seen for user ${data.target}`);
  }
};
