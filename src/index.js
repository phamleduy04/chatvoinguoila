const { MONGODB, OWNERID, TIMEZONE, TYPE_RUN } = process.env;
const { Database } = require('quickmongo');
const db = new Database(MONGODB ? MONGODB : 'mongodb://localhost/chatbattu');
const { getUserProfile, sleep, markSeen, sendAgain } = require('../utils');
const { detectNSFW } = require('../nsfwDetect');
const isURL = require('is-url');
const nsfwDb = db.createModel('nsfw');
// waitlist và logarr set global
global.waitList = null;
global.logArr = [];

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
const firstTimeWarn = new Set();
const ms = require('ms');

module.exports = async function App(ctx) {
  /*
  Postback: GET_STARTED (lúc vừa sử dụng bot)
            START_MATCHING (lúc bấm nút "tìm kiếm")
  */
  if (ctx.event.isPostback) return HandlePostBack;
  // isText: nội dung tin nhắn là string
  else if (ctx.event.isText) return HandleMessage;
  // else if (ctx.event.isEcho) return console.log('echo');
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

async function getAsync(key) {
  // sleep để làm chậm quá trình, giúp giảm tải database
  await sleep(500);
  // get key từ databsae
  return await db.get(key);
}

async function setAsync(key, value) {
  // sleep để làm chậm quá trình, giúp giảm tải database
  await sleep(500);
  // set giá trị vào database
  return await db.set(key, value);
}

async function HandleImage(ctx) {
  const imageUrl = ctx.event.image.url;
  // tính số lần gởi ảnh
  stats.images++;
  try {
    const kq = await detectNSFW(imageUrl);
    console.log(kq);
    const { Hentai, Porn, Sexy } = kq;
    if (Hentai > 0.8 || Porn > 0.8 || Sexy > 0.8) return HandleNSFWImage(ctx, imageUrl);
  }
  catch(e) {
    console.error(e);
    await handleAttachment(ctx, 'image', imageUrl);
  }
  // gởi file xuống function handleAttachment
  await handleAttachment(ctx, 'image', imageUrl);
}

async function HandleNSFWImage(ctx, imageURL) {
  const sender = ctx.event.rawEvent.sender.id;
  const data = await getAsync(sender);
  if (!data || !data.target) return;
  await nsfwDb.set(data.target, imageURL);
  await ctx.sendMessage(
    { text: `Cảnh báo! Hệ thống AI của bot đã phát hiện hình ảnh của người kia gởi bạn có thể chứa nội dung NSFW.\n\nNhập nsfwyes để xem hình ảnh hoặc nếu bạn không muốn xem hãy bỏ qua tin nhắn này!\n\nLệnh chỉ có tác dụng trong 30s!\n` },
    { recipient: { id: data.target } },
  );

  setTimeout(async () => {
    await nsfwDb.delete(data.target);
  }, ms('35s'));
}

async function HandleAudio(ctx) {
  // tính số lần gởi voice
  stats.audio++;
  // gởi file xuống function handleAttachment
  await handleAttachment(ctx, 'audio', ctx.event.audio.url);
}

async function HandleVideo(ctx) {
  // tính số lần gởi video
  stats.videos++;
  // gởi file xuống function handleAttachment
  await handleAttachment(ctx, 'video', ctx.event.video.url);
}

async function HandleFile(ctx) {
  // tính số lần gởi file
  stats.file++;
  // gởi file xuống function handleAttachment
  await handleAttachment(ctx, 'file', ctx.event.file.url);
}

async function HandleMessage(ctx) {
  const userid = ctx.event.rawEvent.sender.id;
  stats.messages++;
  const data = await getAsync(userid);
  // cooldown systems
  if (cooldown.has(userid) && !data) {
    if (firstTimeWarn.has(userid)) return;
    firstTimeWarn.add(userid);
    setTimeout(() => {
      firstTimeWarn.delete(userid);
    }, ms('10s'));
    return ctx.sendText('Bạn đang bị cooldown, vui lòng chờ trong giây lát!');
  }
  cooldown.add(userid);
  setTimeout(() => {
    cooldown.delete(userid);
  }, ms('10s'));
  if (!data) await standby(userid);
  const msgText = ctx.event.message.text.toLowerCase();
  // những lệnh chỉ có owner xài được
  if (userid == OWNERID) {
    if (msgText.startsWith('sendall')) {
      if (!msgText.includes(' '))
        return ctx.sendText('Nhập nội dung cần thông báo');
      const content = msgText.split(' ').slice(1).join(' ');
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
    if (msgText.startsWith('getuser')) {
      if (!msgText.includes(' ')) return ctx.sendText('Nhập ID');
      const id = msgText.split(' ')[1];
      await getUserProfile(ctx, id);
      return;
    }
    switch (msgText) {
      case 'exportlog':
        return ctx.sendText(await exportLog());
      case 'getstat': {
        const stat = await db.get('stats');
        if (!stat) return ctx.sendText('Chờ bot update database!');
        const { messages, matching, images, videos, audio, file } = stat;
        const allDatabase = await db.all();
        const allUser = allDatabase
          .filter((el) => !isNaN(el.ID))
          .map((el) => el.ID);
        return ctx.sendText(
          `Bot hiện tại có ${allUser.length} người dùng, ${messages} tin nhắn đã được gởi, ${matching} lần match, ${images} số lần gởi ảnh, ${videos} lần gởi video, ${audio} lần gởi voice message và ${file} lần gởi file!`,
        );
      }
      case 'locallog':
        console.log(logArr);
        return await ctx.sendText('check console');
    }
  }
  // lệnh mà user sử dụng được
  switch (msgText) {
    case 'exit':
      return unmatch(ctx);
    case 'stop':
      return stop(ctx);
    case 'id':
      return ctx.sendText(`ID của bạn là: ${userid}`);
    case 'nsfwyes': {
      const imageURL = await nsfwDb.get(userid);
      if (!imageURL) return ctx.sendText('Không tìm thấy dữ liệu bạn yêu cầu! Vui lòng thử lại sau!');
      return await handleAttachment(ctx, 'image', imageURL);
    }
    case 'menu':
      return await menu(ctx);
    case 'search':
      return await wait(ctx);
    default:
      {
        if (data && data.target) {
          // sleep dề phòng bị spam
          if (TYPE_RUN == 'production') await sleep(9000);
          try {
            await ctx.sendMessage(
              { text: ctx.event.message.text },
              { recipient: { id: data.target } },
            );
          }
          catch(e) {
            await sendAgain(data.target, ctx.event.message.text);
            console.error(e);
          }
        } else menu(ctx);
      }
      break;
  }
}

// Read = When user seen
async function HandleRead(ctx) {
  const id = ctx.event.rawEvent.sender.id;
  const data = await getAsync(id);
  if (!data || !data.target) return;
  try {
    await markSeen(data.target);
  }
  catch(e) {
    console.log(`Can't mark seen for user ${data.target}`);
  }
}

// postback = các button
async function HandlePostBack(ctx) {
  switch (ctx.event.postback.payload) {
    case 'START_MATCHING':
      wait(ctx);
      break;
    case 'GET_STARTED': {
      const userprofile = await ctx.getUserProfile();
      await ctx.sendText(
        `Chào mừng bạn ${userprofile.name} đã đến với Bất Tử bot!\nKhi bạn bấm nút "Tìm kiếm" có nghĩa là bạn đã đồng ý các điều khoản được ghi ở https://bit.ly/3iV6w81\n\nLưu ý:Nếu bạn ở EU sẽ không sử dụng các nút được, bạn vui lòng nhắn "search" nhé!`,
      );
      menu(ctx);
    }
  }
}

// wait = click nút Tìm kiếm, nhập search
async function wait(ctx) {
  const id = ctx.event.rawEvent.sender.id;
  let userData = await getAsync(id);
  if (!userData || (userData.status == 'matching' && id != waitList))
    userData = await standby(id);
  if (userData.status !== 'standby')
    return ctx.sendText('Bạn không thể tìm kiếm lúc này!');
  if (!waitList) {
    await ctx.sendText(
      'Đang tìm kiếm mục tiêu cho bạn, hãy chờ trong giây lát.\nGởi cú pháp "stop" để dừng tìm kiếm.',
    );
    await sleep(1000);
    waitList = id;
    await setAsync(id, { status: 'matching', target: null });
  } else if (userData.status == 'matching')
    return ctx.sendText(
      'Bạn đang ở trong hàng chờ, vui lòng kiên nhẫn chờ đợi!',
    );
  else {
    const matched = waitList;
    waitList = null;
    await sleep(500);
    await setAsync(matched, { status: 'matched', target: id });
    await setAsync(id, { status: 'matched', target: matched });
    const string =
      'Bạn đã ghép đôi thành công! Gởi cú pháp "exit" để kết thúc cuộc hội thoại!';
    const logString = `${id} đã ghép đôi với ${matched}`;
    stats.matching++;
    await logging(logString);
    await ctx.sendText(string);
    await ctx.sendMessage({ text: string }, { recipient: { id: matched } });
  }
}

// ngắt kết nối
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
      { recipient: { id: data.target } },
    );
  }
}

// ngưng tìm kiếm
async function stop(ctx) {
  const id = ctx.event.rawEvent.sender.id;
  if (waitList != id)
    return ctx.sendText('Bạn hiện tại không nằm trong hàng chờ');
  else {
    waitList = null;
    await standby(id);
    return ctx.sendText('Bạn đã ngừng tìm kiếm!');
  }
}

// menu = template cùng nhiều nút để click
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
  return await setAsync(id, { status: 'standby', target: null });
}

// xử lý ảnh, video, audio, file
async function handleAttachment(ctx, type, url) {
  if (!type) return;
  if (!isURL(url)) return;
  const id = ctx.event.rawEvent.sender.id;
  const data = await getAsync(id);
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

// export log ra cho user
async function exportLog() {
  let data = await db.get('log');
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
    },
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
  logArr.push(string);
  console.log(string);
}
// 10p cập nhật database tránh quá tải
setInterval(async () => {
  const stat = await db.get('stats');
  if (!stat) await db.set('stats', stats);
  else {
    for (const key in stats) {
      await db.add(`stats.${key}`, stats[key]);
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
  let log = await db.get('log');
  if (!log) {
    log = [];
    await db.set('log', []);
  }
  await db.set('log', [...log, ...logArr]);
  logArr = [];
}, ms('10m'));

if (TYPE_RUN == 'ci') process.exit();
