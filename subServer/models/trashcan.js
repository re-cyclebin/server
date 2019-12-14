const { model, Schema } = require('mongoose'),

  TrashSchema = new Schema({
    location: {
      latitude: {
        type: String,
        required: [true, 'latitude is required']
      },
      longitude: {
        type: String,
        required: [true, 'longitude is required']
      }
    },
    height: Number,
    weight: Number,
    avaible: Boolean,
    status: Boolean
  }, { timestamps: true })


TrashSchema.pre('save', function(next) {
  this.height = 0;
  this.weight = 0;
  this.avaible = true;
  this.status = false
  next()
})

const TrashCan = model('trashcan', TrashSchema);

module.exports = TrashCan;