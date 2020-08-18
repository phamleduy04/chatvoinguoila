let db;
const redis = require('redis');
const { promisify } = require('util');
const isURL = require('is-url');

if (process.env.REDISTOGO_URL) {
  const rtg = require('url').parse(process.env.REDISTOGO_URL);
  db = redis.createClient(rtg.port, rtg.hostname);
  db.auth(rtg.auth.split(':')[1]);
  console.log('Logged in to redis server!');
} else db = redis.createClient(); // phải cài đặt redis trên máy trước

const delAsync = promisify(db.del).bind(db);
const getAsync = promisify(db.get).bind(db);
const setAsync = promisify(db.set).bind(db);

module.exports = async function App(ctx) {
  if (ctx.event.isPostback) return HandlePostBack;
  else if (ctx.event.isLikeSticker) return unmatch;
  else if (ctx.event.isText) return HandleMessage;
  else if (ctx.event.isImage) return HandleImage;
  else if (ctx.event.isAudio) return HandleAudio;
  else if (ctx.event.isVideo) return HandleVideo;
  else if (ctx.event.isFile) return HandleFile;
};

async function HandleImage(ctx) {
  await handleAttachment(ctx, 'image', ctx.event.image.url);
}

async function HandleAudio(ctx) {
  await handleAttachment(ctx, 'audio', ctx.event.audio.url);
}

async function HandleVideo(ctx) {
  await handleAttachment(ctx, 'video', ctx.event.video.url);
}

async function HandleFile(ctx) {
  await handleAttachment(ctx, 'file', ctx.event.file.url);
}

async function HandleMessage(ctx) {
  let userid = ctx.event.rawEvent.sender.id;
  let data = await getAsync(userid);
  if (!data || data === null) {
    await standby(userid);
    await menu(ctx);
  } else data = toobj(data);
  switch (ctx.event.message.text) {
    case 'exit':
      unmatch(ctx);
      break;
    case 'stop': {
      stop(ctx);
      break;
    }
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
        `Chào mừng bạn ${userprofile.name} đã đến với Bất Tử bot!`
      );
      menu(ctx);
    }
  }
}

async function wait(ctx) {
  let id = ctx.event.rawEvent.sender.id;
  let data = await getAsync('waitlist');
  if (!data || data == 'null') {
    await standby(id);
    await setAsync('waitlist', id);
    await ctx.sendText(
      'Đang tìm kiếm mục tiêu cho bạn, hãy chờ trong giây lát.\nGởi cú pháp "stop" để dừng tìm kiếm.'
    );
  } else if (data == id)
    return ctx.sendText(
      'Bạn đang ở trong hàng chờ, vui lòng kiên nhẫn chờ đợi!'
    );
  else {
    await setAsync(data, tostr({ status: 'matched', target: id }));
    await setAsync(id, tostr({ status: 'matched', target: data }));
    await delAsync('waitlist');
    let string =
      'Bạn đã ghép đôi thành công! Gởi cú pháp "exit" để kết thúc cuộc hội thoại!';
    await ctx.sendText(string);
    await ctx.sendMessage({ text: string }, { recipient: { id: data } });
  }
}

async function unmatch(ctx) {
  const id = ctx.event.rawEvent.sender.id;
  const data = toobj(await getAsync(id));
  if (data.status !== 'matched')
    return ctx.sendText('Bạn hiện tại không có match với ai!');
  else {
    await standby(data.target);
    await standby(id);
    await ctx.sendText('Đã ngắt kết nối với đối phương!');
    await ctx.sendMessage(
      { text: 'Người bên kia đã ngắt kết nối với bạn 😢.' },
      { recipient: { id: data.target } }
    );
  }
}

async function stop(ctx) {
  const id = ctx.event.rawEvent.sender.id;
  const data = toobj(await getAsync(id));
  if (data.status !== 'matching')
    return ctx.sendText('Bạn hiện tại không nằm trong hàng chờ');
  else {
    await delAsync('waitlist');
    await standby(id);
  }
}
async function menu(ctx) {
  await ctx.sendButtonTemplate('Chọn các nút ở dưới để sử dụng bot!', [
    {
      type: 'postback',
      title: 'Bắt đầu',
      payload: 'START_MATCHING',
    },
    {
      type: 'web_url',
      title: 'Góp ý cho bot',
      url: 'https://github.com/phamleduy04',
    },
  ]);
}

function tostr(obj) {
  return JSON.stringify(obj);
}

function toobj(str) {
  return JSON.parse(str);
}

async function standby(id) {
  await setAsync(id, tostr({ status: 'standby', target: null }));
}

async function handleAttachment(ctx, type, url) {
  if (!isURL(url)) return;
  const id = ctx.event.rawEvent.sender.id;
  let data = await getAsync(id);
  if (!data || data == null) {
    await standby(id);
    menu(ctx);
  }
  data = toobj(data);
  if (data.target) {
    // chờ fix
    switch (type) {
      case 'image':
        ctx.sendImage(url, { recipient: { id: data.target } });
        break;
      case 'video':
        ctx.sendVideo(url, { recipient: { id: data.target } });
        break;
      case 'audio':
        ctx.sendAudio(url, { recipient: { id: data.target } });
        break;
      case 'file':
        ctx.sendFile(url, { recipient: { id: data.target } });
        break;
    }
  }
}

if (process.env.TYPE_RUN == 'ci') process.exit();
