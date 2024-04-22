const { getFriends, getRequests, rejectRequest, addRequest, deleteRequest } = require('../controller/friendController');

const friendRouter = require('express').Router();

// GET ALL FRIENDS
friendRouter.get('/', getFriends)

// GET ALL FRIEND REQUESTS
friendRouter.get('/', getRequests)

// REJECT FRIEND REQUEST
friendRouter.post('/:request', rejectRequest)

// ADD FRIEND REQUEST
friendRouter.post('/:communitymember', addRequest)

// DELETE FRIEND REQUEST
friendRouter.delete('/:request', deleteRequest)

module.exports = friendRouter;