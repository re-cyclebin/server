const Route = require('express').Router();
const userRoute = require('./user');
const trashRoute = require('./trash');
const historyRoute = require('./history');

Route.use('/', userRoute);
Route.use('/trashcan', trashRoute);
Route.use('/history', historyRoute);

module.exports = Route;