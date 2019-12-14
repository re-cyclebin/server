const { redis } = require('../cache')

module.exports = {
  async saveHistory (payload) {
    await redis.set('saveHistory', JSON.stringify(payload));
    console.log('save History to cache is successfully');
  },
  async saveTrashCan (payload) {
    await redis.set('saveTrashCan', JSON.stringify(payload));
    console.log('save TrashCan to cace is successfully');
  }
}