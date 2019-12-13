const { Trash } = require('../models')

module.exports = {
  createTrash ( req, res, next ) {
    const { longitude, latitude } = req.body,
      location = { longitude, latitude }
    Trash.create({ location })
      .then(trash => res.status(201).json({ trash }))
      .catch(next)
  },
  getAllTrash ( req, res, next ) {
    Trash.find()
      .then(trasher => res.status(200).json({ trasher }))
      .catch(next)
  },
  updateTrashPuller ( req, res, next ) {
    const { height, weight } = req.body;
    if(!height || !weight) next({ status: 400, msg: 'missing height/weight value' })
    else {
      Trash.findById(req.params.id)
        .then(trash => {
          return Trash.findByIdAndUpdate(req.params.id, { height, weight }, { new: true })
        })
        .then(trash => res.status(200).json({ trash }))
        .catch(next)
    }
  },
  updateTrashAdmin ( req, res, next ) {
    const { location } = req.body;

    if(!location.longitude || !location.latitude) next({ status: 400, msg: 'missing longitude/latitude' })
    else {
      Trash.findById(req.params.id)
        .then(trash => {
          return Trash.findByIdAndUpdate(req.params.id, { location }, { new: true })
        })
        .then(trash => res.status(200).json({ trash }))
        .catch(next)
    }
  },
  deleteTrashAdmin ( req, res, next ) {
    Trash.findByIdAndDelete(req.params.id)
      .then(_ => {
        res.status(200).json({ msg: 'trashcan successfully deleted' })
      })
      .catch(next)
  }
}