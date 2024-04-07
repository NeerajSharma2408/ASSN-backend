const notificationRoutes = require('express').Router();

const { getAllNotification } = require('../controller/notificationController');

// GET ALL NOTIFICATIONS
notificationRoutes.get('/', getAllNotification)

module.exports = notificationRoutes