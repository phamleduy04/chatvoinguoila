const { MONGODB } = process.env;
const { Database } = require('quickmongo');
const db = new Database(MONGODB ? MONGODB : 'mongodb://localhost/chatbattu');
const { sleep } = require('./utils');
const nsfwDb = db.createModel('nsfw');

module.exports = {
    get: async function(key) {
        await sleep(500);
        return await db.get(key);
    },
    set: async function(key, value) {
        await sleep(500);
        return await db.set(key, value);
    },
    standby: async function(id) {
        return await module.exports.set(id, { status: 'standby', target: null });
    },
    nsfwDb: async function() {
        return nsfwDb;
    },
    getAll: async function() {
        return await db.all();
    },
    add: async function(key, value) {
        return await db.add(key, value);
    },
};