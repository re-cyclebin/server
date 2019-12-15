const { saveTrashCan } = require('../helpers'),
  { redis } = require('../cache'),
  { axios } = require('../apis')

module.exports = {
  async AllTrashCan (token) {
    const { data } = await axios({ method: 'get', url: '/trashcan', headers: { token } })
    return data.trasher;
  },
  async createNewTrashCan ({ longitude, latitude, token }) {
    const { data } = await axios({ method: 'post', url: '/trashcan/admin', headers: { token }, data: { longitude, latitude } })
    return data.trash
  },
  async updateLocationTrashCan ({ id, token, longitude, latitude }) {
    const { data } = await axios({ method: 'patch', url: `/trashcan/admin/${id}`, data: { longitude, latitude }, headers: { token } })
    return data.trash
  },
  async deleteTrashCan ({ id, token }) {
    const { data } = await axios({ method: 'delete', url: `/trashcan/admin/${id}`, headers: { token } })
    return data.msg
  },
  async openTrashCan ({ id, token }) {
    const { data } = await axios({ method: 'patch', url: `/trashcan/status/${id}`, headers: { token } })
    return data.trash
  }
}