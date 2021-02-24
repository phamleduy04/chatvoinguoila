const handleAttachment = require('./attachments');
module.exports = async (ctx) => {
    // tính số lần gởi voice
    stats.audio++;
    // gởi file xuống function handleAttachment
    await handleAttachment(ctx, "audio", ctx.event.audio.url);
};