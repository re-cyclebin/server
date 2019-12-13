const Route = require('express').Router();
const userRoute = require('./user');
const trashRoute = require('./trash');

Route.use('/', userRoute);
Route.use('/trashcan', trashRoute);

module.exports = Route;