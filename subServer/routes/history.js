const Route = require('express').Router(),
  { historyController } = require('../controllers'),
  { createHistory, getAllHistories, deleteHistory } = historyController,
  { auth } = require('../middlewares'),
  { authentication, authorPuller, authorAdmin } = auth

Route.get('/', authentication, getAllHistories);
Route.post('/:id', authentication, authorPuller, createHistory);
Route.delete('/:id', authentication, authorAdmin, deleteHistory);

module.exports = Route;