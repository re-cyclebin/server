const { User, UserHistory } = require('../models'),
  { jwt } = require('../helpers'),
  { decodeToken } = jwt

module.exports = {
  authentication (req, res, next) {
    try {
      if(req.headers.token) {
        const decode = decodeToken(req.headers.token);
        User.findById(decode.id)
          .then(user => {
            if(user) req.loggedUser = decode;
            next()
          })
          .catch(next)
      } else next({ status: 403, msg: 'Authentication Error' })
    } catch (err) { next(err) }
  },
  authorAdmin ( req, res, next ) {
    try {
      User.findById(req.loggedUser.id)
        .then(user => {
          if(user.role === 'admin') next()
          else next({ status:403, msg: 'Do not have access' })
        })
        .catch(next)
    } catch (err) { next(err) }
  },
  authorPuller ( req, res, next ) {
    try {
      User.findById(req.loggedUser.id)
        .then(user => {
          if(user.role === 'puller') next();
          else next({ status: 403, msg: 'Do not have access' })
        })
    } catch (err) { next(err) }
  },
  authorUser ( req, res, next ) {
    try {
      User.findById(req.loggedUser.id)
        .then(user => {
          if(user.role === 'user') next();
          else next({ status: 403, msg: 'Do not have access' })
        })
    } catch (err) { next(err) }
  },
  authorDeleteHistory ( req, res, next ) {
    try {
      UserHistory.findById(req.params.id)
        .then(his => {
          if(his.UserId == req.loggedUser.id) next()
          else next({ status: 403, msg: 'Authorization Error' })
        })
    } catch(err) { next(err) }
  }
}