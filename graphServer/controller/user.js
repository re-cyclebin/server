const { axios } = require('../apis')

module.exports = {
  async userSignin (token) {
    console.log('masuk ke controller', token)
    const { data } = await axios({ method: 'get', url: '/usersignin', headers: { token } })
    console.log(data)
    return data.user
  },
  async signup ({ username, password, email }) {
    const { data } = await axios({ method: 'post', url: '/signup', data: { username, email, password } })
    return data.user
  },
  async signin ({ request, password }) {
    const { data } = await axios({ method: 'post', url: '/signin', data: { request, password } })
    return data
  }
}