const { History, Trash } = require('../models');

module.exports = {
  createHistory ( req, res, next ) {
    Trash.findById(req.params.id)
      .then(trash => {
        return History.create({ height: trash.height, weight: trash.weight, Puller: req.loggedUser.id, TrashId: req.params.id })
      })
      .then(history => {
        tempHistory = history;
        return Trash.findByIdAndUpdate(req.params.id, { height: 0, weight: 0, avaible: true }, { new: true })
      })
      .then(trash => res.status(201).json({ trash, history: tempHistory }))
      .catch(next)
  },
  getAllHistories ( req, res, next ) {
    History.find().populate('Puller').populate('TrashId')
      .then(histories => res.status(200).json({ histories }))
      .catch(next);
  },
  deleteHistory ( req, res, next ) {
    History.findByIdAndDelete(req.params.id)
      .then(_ => res.status(200).json({ msg: 'success delete history' }))
      .catch(next)
  }
}