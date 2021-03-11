const { get } = require('../functions/database');
const menu = require('../userReq/menu');
const isURL = require('is-url');
const TinyURL = require('tinyurl');
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
      case "video": {
        try {
          await ctx.sendVideo(url, { recipient: { id: data.target } });
        }
        catch(e) {
          console.log(e.message);
          const vidUrl = await TinyURL.shorten(url);
          await ctx.sendMessage(
            { text: `Người bên kia đã gởi bạn 1 video: Xem tại ${vidUrl}` },
            { recipient: { id: data.target } },
          );
        }
        break;
      }
      case "audio": {
        try {
          await ctx.sendAudio(url, { recipient: { id: data.target } });
        }
        catch(e) {
          const audioUrl = await TinyURL.shorten(url);
          await ctx.sendMessage(
            { text: `Người bên kia đã gởi bạn voice message: Nghe tại ${audioUrl}` },
            { recipient: { id: data.target } },
          );
        }
      }
        break;
      case "file":
        await ctx.sendFile(url, { recipient: { id: data.target } });
        break;
    }
  }
};
