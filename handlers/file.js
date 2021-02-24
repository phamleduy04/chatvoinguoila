const handleAttachment = require('./attachments');
module.exports = async (ctx) => {
  // tính số lần gởi file
  stats.file++;
  // gởi file xuống function handleAttachment
  await handleAttachment(ctx, "file", ctx.event.file.url);
};
