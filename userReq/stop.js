const { standby } = require('../functions/database');
module.exports = async (ctx) => {
  const id = ctx.event.rawEvent.sender.id;
  if (waitList != id)
    return ctx.sendText("Bạn hiện tại không nằm trong hàng chờ");
  else {
    waitList = null;
    await standby(id);
    return ctx.sendText("Bạn đã ngừng tìm kiếm!");
  }
};
