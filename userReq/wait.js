const { get, set, standby } = require('../functions/database');
const { sleep, logging } = require('../functions/utils');
module.exports = async (ctx) => {
  const id = ctx.event.rawEvent.sender.id;
  let userData = await get(id);
  if (!userData || (userData.status == "matching" && id != waitList))
    userData = await standby(id);
  if (userData.status !== "standby")
    return ctx.sendText("Bạn không thể tìm kiếm lúc này!");
  if (!waitList) {
    await ctx.sendText(
      'Đang tìm kiếm mục tiêu cho bạn, hãy chờ trong giây lát.\nGởi cú pháp "stop" để dừng tìm kiếm.',
    );
    await sleep(1000);
    waitList = id;
    await set(id, { status: "matching", target: null });
  } else if (userData.status == "matching")
    return ctx.sendText(
      "Bạn đang ở trong hàng chờ, vui lòng kiên nhẫn chờ đợi!",
    );
  else {
    const matched = waitList;
    waitList = null;
    await sleep(500);
    await set(matched, { status: "matched", target: id });
    await set(id, { status: "matched", target: matched });
    const string =
      'Bạn đã ghép đôi thành công! Gởi cú pháp "exit" để kết thúc cuộc hội thoại!';
    const logString = `${id} đã ghép đôi với ${matched}`;
    stats.matching++;
    logging(logString);
    await ctx.sendText(string);
    await ctx.sendMessage({ text: string }, { recipient: { id: matched } });
  }
};
