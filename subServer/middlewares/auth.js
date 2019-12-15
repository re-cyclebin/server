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
            req.loggedUser = decode;
            next()
          })
          .catch(next)
      } else next({ status: 403, msg: 'Authentication Error' })
    } catch (err) { next(err) }
  },
  authorAdmin ( req, res, next ) {
    User.findById(req.loggedUser.id)
      .then(user => {
        if(user.role === 'admin') next()
        else next({ status:403, msg: 'Do not have access' })
      })
      .catch(next)
  },
  authorPuller ( req, res, next ) {
    User.findById(req.loggedUser.id)
      .then(user => {
        if(user.role === 'puller') next();
        else next({ status: 403, msg: 'Do not have access' })
      })
      .catch(next)

  },
  authorUser ( req, res, next ) {
    User.findById(req.loggedUser.id)
      .then(user => {
        if(user.role === 'user') next();
        else next({ status: 403, msg: 'Do not have access' })
      })
  },
  authorDeleteHistory ( req, res, next ) {
    UserHistory.findById(req.params.id)
      .then(his => {
        if(his.UserId == req.loggedUser.id) next()
        else next({ status: 403, msg: 'Authorization Error' })
      })
  },
  checkForSignup ( req, res, next ) {
    if(req.body.role){
      req.loggedRole = req.body.role;
      next()
    }else next()
  },
  isAdmin ( req, res, next ) {
    try {
      if(req.loggedRole)  {
        if(req.headers.token) {
          let decode = decodeToken(req.headers.token);
          req.loggedUser = decode;
          next()
        }else next({ status: 403, msg: 'Do not have access' })
      }else next()
    } catch(err) { next(err) }
  },
  authorizationSignUpRole ( req, res, next ) {
    if(req.loggedUser) {
      User.findById(req.loggedUser.id)
        .then(user => {
          if(user.role === 'admin') next();
          else next({ status: 403, msg: 'Do not have access' })
        })
        .catch(next)
    }else next()
  }
}