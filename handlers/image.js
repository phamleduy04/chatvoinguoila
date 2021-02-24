const { default: PQueue } = require('p-queue');
const nsfwQueue = new PQueue({ concurrency: 2 });
const { parse } = require('url');
const { detectNSFW } = require('../functions/nsfwDetect');
const handleAttachment = require('./attachments');
const HandleNSFWImage = require('./nsfw');
module.exports = async (ctx) => {
  const imageUrl = ctx.event.image.url;
  // tính số lần gởi ảnh
  stats.images++;
  try {
    const pathname = parse(imageUrl).pathname;
    // update sau!
    if (pathname.endsWith(".gif"))
      throw new Error(
        "Error này dùng để gởi ảnh mà không qua bước kiểm tra NSFW",
      );
    // const kq = await detectNSFW(imageUrl);
    const kq = await nsfwQueue.add(async () => await detectNSFW(imageUrl));
    const { Hentai, Porn, Sexy } = kq;
    if (Hentai > 0.8 || Porn > 0.8 || Sexy > 0.8)
      return HandleNSFWImage(ctx, imageUrl, kq);
  } catch (e) {
    console.error(e.message);
    return await handleAttachment(ctx, "image", imageUrl);
  }
  // gởi file xuống function handleAttachment
  await handleAttachment(ctx, "image", imageUrl);
};
