const { TYPE_RUN } = process.env;
const { sleep } = require('../functions/utils');
const HandlePostBack = require('../handlers/postback');
const HandleMessage = require('../handlers/messages');
const HandleImage = require('../handlers/image');
const HandleVideo = require('../handlers/video');
const HandleFile = require('../handlers/file');
const HandleRead = require('../handlers/read');
const HandleAudio = require('../handlers/audio');
const { get, set, add } = require('../functions/database');
const { readdirSync } = require('fs');

readdirSync('./quickreplies/').filter(file => file.endsWith('.js')).forEach(promptFunc => {
  require(`../quickreplies/${promptFunc}`);
});

// waitlist và logarr set global
global.waitList = null;
global.logArr = [];
global.stats = {
  messages: 0,
  matching: 0,
  images: 0,
  videos: 0,
  audio: 0,
  file: 0,
};

const ms = require('ms');

module.exports = async function App(ctx) {
  /*
  Postback: GET_STARTED (lúc vừa sử dụng bot)
            START_MATCHING (lúc bấm nút "tìm kiếm")
  */
  if (ctx.event.isPostback) return HandlePostBack;
  // isText: nội dung tin nhắn là string
  else if (ctx.event.isText) return HandleMessage;
  // echo = duplicate request
  else if (ctx.event.isEcho) return console.log('Echo');
  // isImage: nội dung tin nhắn là hình ảnh (sticker cũng tính)
  else if (ctx.event.isImage) return HandleImage;
  // isAudio: nội dung tin nhắn là voice message
  else if (ctx.event.isAudio) return HandleAudio;
  // isVideo: nội dung tin nhắn là video
  else if (ctx.event.isVideo) return HandleVideo;
  // isFile: nội dung tin nhắn là file
  else if (ctx.event.isFile) return HandleFile;
  // isRead: nếu nội dung tin nhắn đã được đọc
  else if (ctx.event.isRead) return HandleRead;
  // tất cả các event đều được chuyển tới function ở dưới kèm theo param (ctx)
};

// 10p cập nhật database tránh quá tải
setInterval(async () => {
  const stat = await get('stats');
  if (!stat) await set('stats', stats);
  else {
    for (const key in stats) {
      await add(`stats.${key}`, stats[key]);
      await sleep(500);
    }
    stats = {
      messages: 0,
      matching: 0,
      images: 0,
      videos: 0,
      audio: 0,
      file: 0,
    };
  }
  let log = await get('log');
  if (!log) {
    log = [];
    await set('log', []);
  }
  await set('log', [...log, ...logArr]);
  logArr = [];
}, ms('10m'));

if (TYPE_RUN == 'ci') process.exit();
