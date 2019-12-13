const { model, Schema } = require('mongoose'),

  HistorySchema = new Schema({
    Puller: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    TrashId: {
      type: Schema.Types.ObjectId,
      ref: 'trashcan'
    },
    height: { type: Number, required: [true, 'height is required'] },
    weight: { type: Number, required: [true, 'weight is required'] }
  }, { timestamps: true })

const History = model('histories', HistorySchema);

module.exports = History;