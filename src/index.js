/* eslint-disable no-undef */
const { MONGODB, OWNERID, TIMEZONE, TYPE_RUN } = process.env;
const { Database } = require('quickmongo');
const db = new Database(MONGODB ? MONGODB : 'mongodb://localhost/chatbattu');
const { getUserProfile, sleep } = require('../utils');
const isURL = require('is-url');
const qdb = require('quick.db');
global.waitList = null;

let stats = {
  messages: 0,
  matching: 0,
  images: 0,
  videos: 0,
  audio: 0,
  file: 0,
};

// cooldown system for matching system
const cooldown = new Set();
const ms = require('ms');

module.exports = async function App(ctx) {
  /*
  Postback: GET_STARTED (lúc vừa sử dụng bot)
            START_MATCHING (lúc bấm nút "tìm kiếm")
  */
  if (ctx.event.isPostback) return HandlePostBack;
  // isText: nội dung tin nhắn là string
  else if (ctx.event.isText) return HandleMessage;
  // isImage: nội dung tin nhắn là hình ảnh (sticker cũng tính)
  else if (ctx.event.isImage) return HandleImage;
  // isAudio: nội dung tin nhắn là voice message
  else if (ctx.event.isAudio) return HandleAudio;
  // isVideo: nội dung tin nhắn là video
  else if (ctx.event.isVideo) return HandleVideo;
  // isFile: nội dung tin nhắn là file
  else if (ctx.event.isFile) return HandleFile;

  // tất cả các event đều được chuyển tới function ở dưới kèm theo param (ctx)
};

async function getAsync(key) {
  await sleep(1000);
  return await db.get(key);
}

async function setAsync(key, value) {
  await sleep(1000);
  return await db.set(key, value);
  // return await db.update(key, value);
}

async function HandleImage(ctx) {
  stats.images++;
  await handleAttachment(ctx, 'image', ctx.event.image.url);
}

async function HandleAudio(ctx) {
  stats.audio++;
  await handleAttachment(ctx, 'audio', ctx.event.audio.url);
}

async function HandleVideo(ctx) {
  stats.videos++;
  await handleAttachment(ctx, 'video', ctx.event.video.url);
}

async function HandleFile(ctx) {
  stats.file++;
  await handleAttachment(ctx, 'file', ctx.event.file.url);
}

async function HandleMessage(ctx) {
  let userid = ctx.event.rawEvent.sender.id;
  stats.messages++;
  let data = await getAsync(userid);
  if (cooldown.has(userid) && !data)
    ctx.sendText('Bạn đang bị cooldown, vui lòng chờ trong giây lát!');
  cooldown.add(userid);
  setTimeout(() => {
    cooldown.delete(userid);
  }, ms('10s'));
  if (!data) await standby(userid);
  let msgText = ctx.event.message.text.toLowerCase();
  if (userid == OWNERID) {
    if (msgText.startsWith('sendall')) {
      if (!msgText.includes(' '))
        return ctx.sendText('Nhập nội dung cần thông báo');
      const content = msgText.split(' ').slice(1).join(' ');
      console.log(content);
      const allDatabase = await db.all();
      const allUser = allDatabase
        .filter((el) => !isNaN(el.ID))
        .map((el) => el.ID);
      allUser.forEach(async (user) => {
        await ctx.sendMessage(
          { text: `Thông báo từ admin: ${content}` },
          { recipient: { id: user } }
        );
        console.log(`Đã thông báo cho ${user}`);
        await sleep(500);
      });
      return;
    }
    switch (msgText) {
      case 'exportlog':
        return ctx.sendText(await exportLog());
      case 'getuser': {
        if (!msgText.includes(' ')) return ctx.sendText('Nhập ID');
        const id = msgText.split(' ')[1];
        return await getUserProfile(ctx, id);
      }
      case 'getstat': {
        const stat = await db.get('stats');
        if (!stat) return ctx.sendText('Chờ bot update database!');
        const { messages, matching, images, videos, audio, file } = stat;
        const allDatabase = await db.all();
        const allUser = allDatabase
          .filter((el) => !isNaN(el.ID))
          .map((el) => el.ID);
        return ctx.sendText(
          `Bot hiện tại có ${allUser.length} người dùng, ${messages} tin nhắn đã được gởi, ${matching} lần match, ${images} số lần gởi ảnh, ${videos} lần gởi video, ${audio} lần gởi voice message và ${file} lần gởi file!`
        );
      }
    }
  }
  switch (msgText) {
    case 'exit':
      return unmatch(ctx);
    case 'stop': {
      return stop(ctx);
    }
    case 'id':
      return ctx.sendText(`ID của bạn là: ${userid}`);
    case 'menu':
      return await menu(ctx);
    case 'search':
      return await wait(ctx);
    default:
      {
        if (data && data.target)
          await ctx.sendMessage(
            { text: ctx.event.message.text },
            { recipient: { id: data.target } }
          );
        else menu(ctx);
      }
      break;
  }
}

async function HandlePostBack(ctx) {
  switch (ctx.event.postback.payload) {
    case 'START_MATCHING':
      wait(ctx);
      break;
    case 'GET_STARTED': {
      let userprofile = await ctx.getUserProfile();
      await ctx.sendText(
        `Chào mừng bạn ${userprofile.name} đã đến với Bất Tử bot!\nKhi bạn bấm nút "Tìm kiếm" có nghĩa là bạn đã đồng ý các điều khoản được ghi ở https://bit.ly/3iV6w81\n\nLưu ý:Nếu bạn ở EU sẽ không sử dụng các nút được, bạn vui lòng nhắn "search" nhé!`
      );
      menu(ctx);
    }
  }
}

async function wait(ctx) {
  let id = ctx.event.rawEvent.sender.id;
  let userData = await getAsync(id);
  if (!userData) userData = await standby(id);
  if (!waitList) {
    await ctx.sendText(
      'Đang tìm kiếm mục tiêu cho bạn, hãy chờ trong giây lát.\nGởi cú pháp "stop" để dừng tìm kiếm.'
    );
    await sleep(2000);
    waitList = id;
    await setAsync(id, { status: 'matching', target: null });
  } else if (userData && userData.status == 'matching')
    return ctx.sendText(
      'Bạn đang ở trong hàng chờ, vui lòng kiên nhẫn chờ đợi!'
    );
  else {
    const matched = waitList;
    waitList = null;
    await sleep(500);
    await setAsync(matched, { status: 'matched', target: id });
    await setAsync(id, { status: 'matched', target: matched });
    let string =
      'Bạn đã ghép đôi thành công! Gởi cú pháp "exit" để kết thúc cuộc hội thoại!';
    const logString = `${id} đã ghép đôi với ${matched}`;
    stats.matching++;
    await logging(logString);
    await ctx.sendText(string);
    await ctx.sendMessage({ text: string }, { recipient: { id: matched } });
  }
}

async function unmatch(ctx) {
  const id = ctx.event.rawEvent.sender.id;
  const data = await getAsync(id);
  if (data.status !== 'matched')
    return ctx.sendText('Bạn hiện tại không có match với ai!');
  else {
    await standby(data.target);
    await standby(id);
    await logging(`${id} đã ngắt kết nói với ${data.target}`);
    await ctx.sendText('Đã ngắt kết nối với đối phương!');
    await ctx.sendMessage(
      { text: 'Người bên kia đã ngắt kết nối với bạn 😢.' },
      { recipient: { id: data.target } }
    );
  }
}

async function stop(ctx) {
  const id = ctx.event.rawEvent.sender.id;
  const data = await getAsync(id);
  if (data.status !== 'matching')
    return ctx.sendText('Bạn hiện tại không nằm trong hàng chờ');
  else {
    await qdb.delete('waitlist');
    await standby(id);
    return ctx.sendText('Bạn đã ngừng tìm kiếm!');
  }
}

async function menu(ctx) {
  await ctx.sendButtonTemplate('Chọn các nút ở dưới để sử dụng bot!', [
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
}

async function standby(id) {
  await setAsync(id, { status: 'standby', target: null });
}

async function handleAttachment(ctx, type, url) {
  if (!type) return;
  if (!isURL(url)) return;
  const id = ctx.event.rawEvent.sender.id;
  let data = await getAsync(id);
  if (!data) menu(ctx);
  else if (data.target) {
    switch (type.toLowerCase()) {
      case 'image':
        await ctx.sendImage(url, { recipient: { id: data.target } });
        break;
      case 'video':
        await ctx.sendVideo(url, { recipient: { id: data.target } });
        break;
      case 'audio':
        await ctx.sendAudio(url, { recipient: { id: data.target } });
        break;
      case 'file':
        await ctx.sendFile(url, { recipient: { id: data.target } });
        break;
    }
  }
}

async function exportLog() {
  let data = await qdb.get('log');
  data = data.join('\n');
  const { create } = require('sourcebin');
  const bin = await create(
    [
      {
        content: data,
        language: 'text',
      },
    ],
    {
      title: 'User log',
      description: 'User log',
    }
  );
  return bin.url;
}

async function logging(text) {
  if (!text) return;
  const moment = require('moment-timezone');
  const timenow = moment()
    .tz(TIMEZONE || 'America/Chicago')
    .format('lll');
  const string = `${timenow} || ${text}`;
  console.log(string);
  await qdb.push('log', string);
}

setInterval(async () => {
  const stat = await db.get('stats');
  if (!stat) await db.set('stats', stats);
  else {
    for (const key in stats) {
      await db.add(`stats.${key}`, stats[key]);
      await sleep(500);
      stats = {
        messages: 0,
        matching: 0,
        images: 0,
        videos: 0,
        audio: 0,
        file: 0,
      };
    }
  }
}, ms('10m'));

if (TYPE_RUN == 'ci') process.exit();
