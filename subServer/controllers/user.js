const { User } = require('../models'),
  { jwt, hash } = require('../helpers'),
  { signToken } = jwt,
  { comparePassword } = hash,
  { selection } = require('../function')


module.exports = {
  signup (req, res, next) {
    const {email, username, password, role} = req.body;
    User.create({ email, username, password, role })
      .then(user => res.status(201).json({ user }))
      .catch(next)
  },
  signin (req, res, next) {
    const {request, password} = req.body;
    if(!request || !password) next({ status: 400, msg: 'missing request/password value' })
    else {
      User.findOne({ $or: [ {username: request}, {email: request} ] })
        .then(user => {
          if(user && comparePassword(password, user.password)) {
            res.status(200).json({ user, token: signToken({ id: user._id, username: user.username, email: user.email }) })
          } else next({ status: 400, msg: 'request/password wrong' })
        })
        .catch(next)
    }
  },
  getSignInUser (req, res, next) {
    User.findById(req.loggedUser.id)
      .then(user => res.status(200).json({ user }))
      .catch(next)
  },
  changeRewards (req, res, next) {
    const { getReward } = req.body;
    let getUser = ''
    User.findById(req.loggedUser.id)
      .then(user => {
        if(Number(user.point) < 10000) next({ status: 400, msg: 'the point are not enough'})
        else {
          getUser = user
          return selection(user.point, getReward)
        }
      })
      .then(result => {
        return User.findByIdAndUpdate(req.loggedUser.id, { point: Number(result), reward: Number(getUser.reward) + Number(getReward) }, { new: true })
      })
      .then(user => res.status(200).json({ user }))
      .catch(next)
  }
}