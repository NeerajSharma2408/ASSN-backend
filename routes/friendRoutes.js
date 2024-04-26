const { getFriends, getRequests, removeFriend, rejectRequest, addRequest, acceptRequest, deleteRequest } = require('../controller/friendController');

const friendRouter = require('express').Router();

// GET ALL FRIENDS
friendRouter.get('/friend', getFriends)

// REMOVE FRIEND
friendRouter.delete('/friend/:user', removeFriend)

// GET ALL FRIEND REQUESTS
friendRouter.get('/request', getRequests)

// ADD FRIEND REQUEST
friendRouter.post('/request/add/:user', addRequest)

// ACCEPT FRIEND REQUEST
friendRouter.post('/request/accept/:request', acceptRequest)

// REJECT FRIEND REQUEST
friendRouter.post('/request/remove/:request', rejectRequest)

// DELETE FRIEND REQUEST
friendRouter.delete('/request/:request', deleteRequest)

module.exports = friendRouter;