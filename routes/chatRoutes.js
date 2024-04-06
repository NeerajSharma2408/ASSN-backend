const chatRoutes = require('express').Router();

const { getAllMessages } = require('../controller/chatController');

chatRoutes.get('/', getAllMessages)

module.exports = chatRoutes