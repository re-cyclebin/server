const { Trash, User } = require('../models')

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
  updateTrashAdmin ( req, res, next ) {
    const { longitude, latitude } = req.body,
      location = { longitude, latitude }

    if(!longitude || !latitude) next({ status: 400, msg: 'missing longitude/latitude' })
    else {
        Trash.findByIdAndUpdate(req.params.id, { location }, { new: true })
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
  },
  updateStatusTrash ( req, res, next ) {
    Trash.findById(req.params.id)
      .then(trash => {
        if(!trash.status) return Trash.findByIdAndUpdate(req.params.id, { status: true }, { new: true })
        else return Trash.findByIdAndUpdate(req.params.id, { status: false }, { new: true })
      })
      .then(trash => {
        //hapus redis
        res.status(200).json({ trash, msg: 'update success' })
      })
      .catch(next)
  },
  // -------------- IOT CONTROLLER ------------
  updateTrashPushUser ( req, res, next ) {
    const { height, weight } = req.body,
      numHeight = 100.8 - height
    if(!height || !weight) next({ status: 400, msg: 'missing height/weight value' })
    else {
      if(numHeight <= 90) {
        Trash.findByIdAndUpdate(req.params.id, { height: numHeight, weight }, { new: true })
          .then(trash => res.status(200).json({ trash }))
          .catch(next)
      } else {
        Trash.findByIdAndUpdate(req.params.id, { avaible: false }, { new: true })
          .then(trash => res.status(200).json({ trash }))
          .catch(next)
      }
    }
  },
  getStatusTrash ( req, res, next ) {
    Trash.findById(req.params.id)
      .then(trash => {
        //create redis
        res.status(200).json({ status: trash.status })
      })
      .catch(next)
  }
}