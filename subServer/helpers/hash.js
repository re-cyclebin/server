const js = require('bcryptjs'),
  salt = js.genSaltSync(10);

module.exports = {
  hashPassword (password) { return js.hashSync(password, salt) },
  comparePassword (password, hashed) { return js.compareSync(password, hashed) }
}