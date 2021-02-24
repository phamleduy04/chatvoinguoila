const { get, nsfwDb } = require('../functions/database');
module.exports = async (ctx, imageURL, predictData) => {
  const sender = ctx.event.rawEvent.sender.id;
  const data = await get(sender);
  if (!data || !data.target) return;
  await nsfwDb.set(data.target, imageURL);
  await ctx.sendMessage(
    {
      text: `Cảnh báo! Hệ thống AI của bot đã phát hiện hình ảnh của người kia gởi bạn có thể chứa nội dung NSFW.\n\nNhập nsfwyes để xem hình ảnh hoặc nếu bạn không muốn xem hãy bỏ qua tin nhắn này!\n\nLệnh chỉ có tác dụng trong 30s!\n`,
    },
    { recipient: { id: data.target } },
  );
  await nsfwDb.push("log", {
    sender: sender,
    receiver: data.target,
    imageURL: imageURL,
    predictData: predictData,
  });
  setTimeout(async () => {
    await nsfwDb.delete(data.target);
  }, ms("35s"));
};
