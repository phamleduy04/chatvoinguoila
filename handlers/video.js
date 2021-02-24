const handleAttachment = require('./attachments');
module.exports = async (ctx) => {
  // tính số lần gởi video
  stats.videos++;
  // gởi file xuống function handleAttachment
  await handleAttachment(ctx, "video", ctx.event.video.url);
};
