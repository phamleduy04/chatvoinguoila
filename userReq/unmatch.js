const { standby, get } = require('../functions/database');
const { logging } = require('../functions/utils');
module.exports = async (ctx) => {
  const id = ctx.event.rawEvent.sender.id;
  const data = await get(id);
  if (data.status !== "matched")
    return ctx.sendText("Bạn hiện tại không có match với ai!");
  else {
    await standby(data.target, id);
    await standby(id, data.target);
    logging(`${id} đã ngắt kết nói với ${data.target}`);
    await ctx.sendText("Đã ngắt kết nối với đối phương!");
    await ctx.sendMessage(
      { text: "Người bên kia đã ngắt kết nối với bạn 😢." },
      { recipient: { id: data.target } },
    );
  }
};
