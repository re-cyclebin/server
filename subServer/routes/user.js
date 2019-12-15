const Route = require('express').Router(),
  { userController, userHisController } = require('../controllers'),
  { signin, signup, getSignInUser, changeRewards, userGetPoint } = userController,
  { getAllUserHistory, deleteUserHistory, getAllHistoryGlobal } = userHisController,
  { auth } = require('../middlewares'),
  { authentication, authorUser, authorDeleteHistory, authorAdmin, checkForSignup, isAdmin, authorizationSignUpRole } = auth

Route.post('/signin', signin);
Route.post('/signup', checkForSignup, isAdmin, authorizationSignUpRole, signup);

Route.get('/usersignin', authentication, getSignInUser);
Route.patch('/reward', authentication, changeRewards);
Route.patch('/getpoint', authentication, authorUser, userGetPoint);

Route.get('/hisuser', authentication, authorUser, getAllUserHistory);
Route.get('/hisuser/admin', authentication, authorAdmin, getAllHistoryGlobal);
Route.delete('/hisuser/:id', authentication, authorUser, authorDeleteHistory, deleteUserHistory);

module.exports = Route;