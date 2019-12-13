const { History } = require('../models');

module.exports = {
  createHistory ( req, res, next ) {
    const { height, weight } = req.body;
    History.create({ height, weight, Puller: req.loggedUser.id, TrashId: req.params.id })
      .then(history => res.status(201).json({ history }))
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