const { registerAction, prompt } = require("@bottender/proposal-conversation");
const { get } = require('../functions/database');
const { sendOwner } = require('../functions/utils');
registerAction('confirm-report', async function ask(context, props) {
    const userID = ctx.event.rawEvent.sender.id;
    const data = await get(userID);
    const { target, lastMatch } = data;
    let reportID = target;
    if (!reportID) reportID = lastMatch;
    if (!reportID) return await context.sendText('Không tìm thấy người bạn muốn báo cáo!\nHãy sử dụng form để report https://forms.gle/MvihGZ9V1iHECYcT7');
    if (!props.result) {
        await context.sendText(`Bạn có muốn report ${target ? 'người bạn đang match' : 'người bạn đã match trước đó'} không?`, {
            quickReplies: [
                {
                    contentType: 'text',
                    title: 'Có',
                    payload: 'yes',
                },
                {
                    contentType: 'text',
                    title: 'Không',
                    payload: 'no',
                },
            ],
        });
        return prompt('result');
    }

    if (props.result == 'yes') {
        await context.sendText('Bạn đã report thành công!');
        await sendOwner(`NEW REPORT: ${userID} report ${reportID}.`);
    } else if (props.result == 'no') await context.sendText('Đã huỷ report!');
    else await context.sendText('Bot không hiểu ý bạn! Vui lòng thử lại sau!');
});