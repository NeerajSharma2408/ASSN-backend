const chatRoutes = require('express').Router();

const { getAllChatHeads, getAllMessage, getOneLiners } = require('../controller/chatController');

// GET A BUNCH OF ICE BREAKERS FOR STARTING A NEW CONVERSATION
chatRoutes.get('/one-liners/:user', getOneLiners);

// !depreciated routes

// GET ALL CHAT HEADS
chatRoutes.get('/', getAllChatHeads)

// GET ALL Message FOR ONE CHAT HEAD
chatRoutes.get('/:groupId', getAllMessage)

// UPDATE MESSAGE
// CREATE MESSAGE (Standalone or Reply)
// REACT TO MESSAGE
// DELETE ONE MESSAGE FOR ONE CHAT HEAD
// DELETE ALL MESSAGE FOR ONE CHAT HEAD
// DELETE ALL CHAT HEADS

module.exports = chatRoutes