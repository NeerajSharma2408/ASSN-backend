const notificationRoutes = require('express').Router();

const { getAllNotification } = require('../controller/notificationController');

notificationRoutes.get('/', getAllNotification)

module.exports = notificationRoutes