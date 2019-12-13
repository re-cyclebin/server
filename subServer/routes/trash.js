const Route = require('express').Router(),
  { auth } = require('../middlewares'),
  { authentication, authorAdmin, authorPuller } = auth,
  { trashController } = require('../controllers'),
  { createTrash, updateTrashAdmin, updateTrashPuller, deleteTrashAdmin, getAllTrash } = trashController;

Route.get('/', authentication, getAllTrash);
Route.post('/admin', authentication, authorAdmin, createTrash);
Route.patch('/admin/:id', authentication, authorAdmin, updateTrashAdmin);
Route.delete('/admin/:id', authentication, authorAdmin, deleteTrashAdmin);
Route.patch('/pull/:id', authentication, authorPuller, updateTrashPuller);

module.exports = Route;