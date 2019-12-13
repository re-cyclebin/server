const Route = require('express').Router(),
  { userController } = require('../controllers'),
  { signin, signup, getSignInUser, changeRewards } = userController,
  { auth } = require('../middlewares'),
  { authentication } = auth

Route.post('/signin', signin);
Route.post('/signup', signup);

Route.use(authentication)
Route.get('/usersignin', getSignInUser);
Route.patch('/reward', changeRewards);

module.exports = Route;