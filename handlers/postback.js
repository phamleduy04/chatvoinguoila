const wait = require('../userReq/wait');
const menu = require('../userReq/menu');
// postback = các button
module.exports = async (ctx) => {
  switch (ctx.event.postback.payload) {
    case "START_MATCHING":
      await wait(ctx);
      break;
    case "GET_STARTED": {
      const userprofile = await ctx.getUserProfile();
      await ctx.sendText(
        `Chào mừng bạn ${userprofile.name} đã đến với Bất Tử bot!\nKhi bạn bấm nút "Tìm kiếm" có nghĩa là bạn đã đồng ý các điều khoản được ghi ở https://bit.ly/3iV6w81\n\nLưu ý:Nếu bạn ở EU sẽ không sử dụng các nút được, bạn vui lòng nhắn "search" nhé!`,
      );
      await menu(ctx);
    }
  }
};
