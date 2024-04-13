const notificationRoutes = require('express').Router();

const { getAllNotification, deleteAllNotification, deleteNotification } = require('../controller/notificationController');

// GET ALL NOTIFICATIONS
notificationRoutes.get('/', getAllNotification)

// DELETE ALL NOTIFICATIONS
notificationRoutes.delete('/', deleteAllNotification)

// DELETE ONE NOTIFICATION
notificationRoutes.delete('/:notificationId', deleteNotification)

// CREATE NOTIFICATION CONTROLLERS

module.exports = notificationRoutes