const { axios } = require('../apis')

module.exports = {
  async userSignin (token) {
    const { data } = await axios({ method: 'get', url: '/usersignin', headers: { token } })
    return data.user
  },
  async signup ({ username, password, email }) {
    const { data } = await axios({ method: 'post', url: '/signup', data: { username, email, password } })
    return data.user
  },
  async signin ({ request, password }) {
    const { data } = await axios({ method: 'post', url: '/signin', data: { request, password } })
    return data
  },
  async getPoint ({ token, point }) {
    const { data } = await axios({ method: 'patch', url: `/getpoint`, headers: { token }, data: { point } })
    return data.user
  },
  async userGetReward ({ token, getReward }) {
    const { data } =  await axios({ method: 'patch', url: '/reward', headers: { token }, data: { getReward } })
    return data.user
  },

  async userHistory (token) {
    const { data } = await axios({ method: 'get', url: '/hisuser', headers: { token } })
    return data.UserHis
  },
  async deleteHistoryUser ({ token, id }) {
    const { data } = await axios({ method: 'delete', url: `/hisuser/${id}`, headers: { token } })
    return data.msg
  },

  // ADMIN
  async allHistoryAdmin (token) {
    const { data } = await axios({ method: 'get', url: '/hisuser/admin', headers: { token } })
    return data.userHistories
  }
}