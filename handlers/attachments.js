const { get } = require('../functions/database');
const menu = require('../userReq/menu');
const isURL = require('is-url');
module.exports = async (ctx, type, url) => {
  if (!type) return;
  if (!isURL(url)) return;
  const id = ctx.event.rawEvent.sender.id;
  const data = await get(id);
  if (!data) menu(ctx);
  else if (data.target) {
    switch (type.toLowerCase()) {
      case "image":
        await ctx.sendImage(url, { recipient: { id: data.target } });
        break;
      case "video":
        await ctx.sendVideo(url, { recipient: { id: data.target } });
        break;
      case "audio":
        await ctx.sendAudio(url, { recipient: { id: data.target } });
        break;
      case "file":
        await ctx.sendFile(url, { recipient: { id: data.target } });
        break;
    }
  }
};
