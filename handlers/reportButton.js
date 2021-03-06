const { get } = require('../functions/database');
const { sendOwner } = require('../functions/utils');
module.exports = async (ctx) => {
    const userID = ctx.event.rawEvent.sender.id;
    const data = await get(userID);
    const { target, lastMatch } = data;
    let reportID = target;
    if (!reportID) reportID = lastMatch;
    if (!reportID) return await ctx.sendText('Không tìm thấy người bạn muốn báo cáo!\nHãy sử dụng form để report https://forms.gle/MvihGZ9V1iHECYcT7');

    await sendOwner(`NEW REPORT: ${userID} report ${reportID}.`);
    await setLabel(userID, 'report');
    await setLabel(reportID, 'bi-report');
    await ctx.sendText(`Bạn đã report thành công!\n\nID của bạn là ${userID}\n\nLưu ý: Chỉ report những trường hợp vi phạm điều khoản! Nếu lạm dụng nút report sẽ bị cấm sử dụng tính năng này!`);
};

async function setLabel(id, labelName) {
    if (!id || !labelName) return null;
    const labelID = await get(labelName);
    if (!labelID) return null;
    return await client.associateLabel(id, labelID);
}