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
        return await db.set(id, { status: 'standby', target: null });
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
};