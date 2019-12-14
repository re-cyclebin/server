const { Schema, model } = require('mongoose'),

  UserHistorySchema = new Schema({
    point: { type: Number, required: [true, 'point is required']},
    UserId: { type: Schema.Types.ObjectId, ref: 'users' }
  }, { timestamps: true })

const UserHistory = model('hisusers', UserHistorySchema);

module.exports = UserHistory;