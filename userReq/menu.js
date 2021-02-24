// menu = template cùng nhiều nút để click
const jsonData = JSON.parse(require("../jsons/menu.json"));
module.exports = async (ctx) => {
  await ctx.sendButtonTemplate("Chọn các nút ở dưới để sử dụng bot!", jsonData);
};