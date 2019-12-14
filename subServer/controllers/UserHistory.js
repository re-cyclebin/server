const { UserHistory } = require('../models')

module.exports = {
  getAllUserHistory ( req, res, next ) {
    UserHistory.find({ UserId: req.loggedUser.id })
      .then(UserHis => res.status(200).json({ UserHis }))
      .catch(next)
  },
  deleteUserHistory ( req, res, next ) {
    UserHistory.findByIdAndDelete(req.params.id)
      .then(_ => res.status(200).json({ msg: 'delete history success' }))
      .catch(next)
  },
  getAllHistoryGlobal ( req, res, next ) {
    UserHistory.find()
      .then(userHistories => res.status(200).json({ userHistories }))
      .catch(next)
  }
}