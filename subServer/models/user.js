const { model, Schema } = require('mongoose'),
  { hash } = require('../helpers'),
  { hashPassword } = hash,

  UserSchema = new Schema({
    username: { type: String, required: [true, 'username is required'], unique: true },
    password: { type: String, required: [true, 'password is required'], minlength: [5, 'password min 5 char'] },
    email: { type: String, required: [true, 'email is required'], unique: true },
    role: String,
    point: Number,
    reward: Number
  })

UserSchema.path('password').validate(function(val) {
  const capital = /[A-Z]/.test(val);
  if(!capital) return false
}, 'password min 1 capital case')

UserSchema.path('username').validate(function(val) {
  return User.findOne({ username: val })
    .then((user) => {
      if(user) return false
    })
}, 'duplicate username detected')

UserSchema.path('email').validate(function(val) {
  return User.findOne({ email: val })
    .then(user => {
      if(user) return false
    })
}, 'duplicate email detected')

UserSchema.pre('save', function(next) {
  this.password = hashPassword(this.password);
  if(this.role) this.role = this.role
  else this.role = 'user'
  this.point = 0;
  this.reward = 0;
  next()
})

const User = model('users', UserSchema);

module.exports = User