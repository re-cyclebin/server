const Route = require('express').Router(),
  { auth } = require('../middlewares'),
  { authentication, authorAdmin, authorUser } = auth,
  { trashController } = require('../controllers'),
  { createTrash, updateTrashAdmin, updateTrashPushUser, deleteTrashAdmin, getAllTrash, updateStatusTrash, getStatusTrash } = trashController;


Route.get('/', authentication, getAllTrash);
Route.post('/admin', authentication, authorAdmin, createTrash);
Route.patch('/admin/:id', authentication, authorAdmin, updateTrashAdmin);
Route.delete('/admin/:id', authentication, authorAdmin, deleteTrashAdmin);
Route.patch('/status/:id', authentication, authorUser, updateStatusTrash);

// IOT getting status
Route.post('/push/:id', updateTrashPushUser);
Route.get('/iotstatus/:id', getStatusTrash);


module.exports = Route;