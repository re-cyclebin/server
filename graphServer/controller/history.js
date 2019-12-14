const { saveHistory } = require('../helpers'),
 { redis } = require('../cache'),
 { axios } = require('../apis')

module.exports = {
  async getAllHistory (token) {
    const { data } = await axios({ method: 'get', url: '/history', headers: { token } })
    const getSaveHistory = await redis.get('saveHistory')
    if(getSaveHistory) return JSON.parse(getSaveHistory);
    else{
      saveHistory(data.histories);
      return data.histories;
    }
  },
  async makeHistory ({ token, id, height, weight }) {
    const { data } = await axios({ method: 'post', url: `/history/${id}`, data: { height, weight }, headers: { token } })
    return data.history
  },
  async deleteSomeHistory ({ token, id }) {
    const { data } = await axios({ method: 'delete', url: `/history/${id}`, headers: { token } })
    return data.msg
  }
}