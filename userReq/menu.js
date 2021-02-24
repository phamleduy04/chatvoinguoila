// menu = template cùng nhiều nút để click
module.exports = async (ctx) => {
  await ctx.sendButtonTemplate("Chọn các nút ở dưới để sử dụng bot!", [
    {
      type: 'postback',
      title: 'Tìm kiếm',
      payload: 'START_MATCHING',
    },
    {
      type: 'web_url',
      title: 'Báo lỗi và góp ý',
      url: 'https://forms.gle/RHg7wA9Ybs9prkd98',
    },
    {
      type: 'web_url',
      title: 'Báo cáo người khác',
      url: 'https://forms.gle/kQuwrZ2NDdXuki2n9',
    },
  ]);
};