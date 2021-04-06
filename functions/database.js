const { MONGODB } = process.env;
const { Database } = require('quickmongo');
const db = new Database(MONGODB ? MONGODB : 'mongodb://localhost/chatbattu');
const { sleep } = require('./utils');
const nsfwDb = db.createModel('nsfw');
const { getClient } = require('bottender');
const client = getClient('messenger');
module.exports = {
    get: async function(key) {
        await sleep(500);
        return await db.get(key);
    },
    set: async function(key, value) {
        await sleep(500);
        return await db.set(key, value);
    },
    standby: async function(id, lastMatch) {
        await sleep(500);
        return await db.set(id, { status: 'standby', target: null, lastMatch: lastMatch ? lastMatch : null });
    },
    getAll: async function() {
        return await db.all();
    },
    add: async function(key, value) {
        return await db.add(key, value);
    },
    nsfwSet: async function(key, value) {
        return await nsfwDb.set(key, value);
    },
    nsfwPush: async function(key, value) {
        return await nsfwDb.push(key, value);
    },
    nsfwGet: async function(key) {
        return await nsfwDb.get(key);
    },
    nsfwDelete: async function(key) {
        return await nsfwDb.delete(key);
    },
    createLabel: async function(labelName, key) {
        if (!labelName || !key) return null;
        client.createLabel(labelName).then(async label => {
          await module.exports.set(key, label.id);
          return label.id;
        });
      },
      setLabel: async function(id, labelName) {
        if (!id || !labelName) return null;
        const labelID = await module.exports.get(labelName);
        if (!labelID) return null;
        return await client.associateLabel(id, labelID);
      },
};