// cooldown system for matching system
const cooldown = new Set();
const firstTimeWarn = new Set();
const { OWNERID, TYPE_RUN } = process.env;
const { sleep, getUserProfile, checkBadWord, badWordWarning } = require('../functions/utils');
const { get, getAll, standby, nsfwGet } = require('../functions/database');
const menu = require('../userReq/menu');
const unmatch = require('../userReq/unmatch');
const wait = require('../userReq/wait');
const stop = require('../userReq/stop');
const { default: PQueue } = require('p-queue');
const queue = new PQueue({ concurrency: 3 });
const ms = require('ms');
module.exports = async (ctx) => {
  const userid = ctx.event.rawEvent.sender.id;
  stats.messages++;
  const data = await get(userid);
  // cooldown systems
  if (cooldown.has(userid) && !data) {
    if (firstTimeWarn.has(userid)) return;
    firstTimeWarn.add(userid);
    setTimeout(() => {
      firstTimeWarn.delete(userid);
    }, ms("10s"));
    return ctx.sendText("Bạn đang bị cooldown, vui lòng chờ trong giây lát!");
  }
  cooldown.add(userid);
  setTimeout(() => cooldown.delete(userid), ms("10s"));
  if (!data) await standby(userid);
  const msgText = ctx.event.message.text.toLowerCase();
  // những lệnh chỉ có owner xài được
  if (userid == OWNERID || userid == process.env.OWNERID2) {
    if (msgText.startsWith("sendall")) {
      if (!msgText.includes(" ")) return ctx.sendText("Nhập nội dung cần thông báo");
      const content = ctx.event.message.text.split(" ").slice(1).join(" ");
      const allDatabase = await db.all();
      const allUser = allDatabase
        .filter((el) => !isNaN(el.ID))
        .map((el) => el.ID);
      for (let i = 0; i < allUser.length; i++) {
        const user = allUser[i];
        try {
          await ctx.sendMessage(
            { text: `Thông báo từ admin: ${content}` },
            { recipient: { id: user } },
          );
          console.log(`Đã thông báo cho ${user}`);
          await sleep(2000);
        } catch (e) {
          console.log(`Không gởi được cho ${user}`);
        }
      }
      return;
    }
    if (msgText.startsWith("getuser")) {
      if (!msgText.includes(" ")) return ctx.sendText("Nhập ID");
      const id = msgText.split(" ")[1];
      await getUserProfile(ctx, id);
      return;
    }
    switch (msgText) {
      case "getstat": {
        const stat = await get("stats");
        if (!stat) return ctx.sendText("Chờ bot update database!");
        const { messages, matching, images, videos, audio, file } = stat;
        const allDatabase = await getAll();
        const allUser = allDatabase
          .filter((el) => !isNaN(el.ID))
          .map((el) => el.ID);
        return ctx.sendText(
          `Bot hiện tại có ${allUser.length} người dùng, ${messages} tin nhắn đã được gởi, ${matching} lần match, ${images} số lần gởi ảnh, ${videos} lần gởi video, ${audio} lần gởi voice message và ${file} lần gởi file!`,
        );
      }
      case "getlabel": {
        client.getLabelList().then(res => {
          console.log(res);
        });
        return await ctx.sendText('Check console');
      }
      case "locallog":
        console.log(logArr);
        return await ctx.sendText("check console");
    }
  }
  // lệnh mà user sử dụng được
  switch (msgText) {
    case "exit":
      return unmatch(ctx);
    case "stop":
      return stop(ctx);
    case "id":
      return ctx.sendText(`ID của bạn là: ${userid}`);
    case "nsfwyes": {
      const imageURL = await nsfwGet(userid);
      if (!imageURL)
        return ctx.sendText(
          "Không tìm thấy dữ liệu bạn yêu cầu! Vui lòng thử lại sau!",
        );
      return await ctx.sendImage(imageURL);
    }
    case "menu":
      return await menu(ctx);
    case "search":
      return await wait(ctx);
    default:
      {
        if (data && data.target) {
          // sleep dề phòng bị spam
          if (TYPE_RUN == "production") await sleep(5000);
          try {
            const content = ctx.event.message.text;
            await queue.add(async () => {
              await ctx.sendMessage(
                { text: content },
                { recipient: { id: data.target } },
              );
              if (checkBadWord(content)) await badWordWarning(data.target);
            });
          } catch (e) {
            console.error(e);
          }
        } else menu(ctx);
      }
      break;
  }
};
