const postRouter = require('express').Router()

// here check if the user's post to be found is the login user or any other user and hence find and return the nessasary details

// GET ALL POST ROUTE
postRouter.get('/', )

// GET SINGLE POST ROUTE
postRouter.get('/:postid/', )

// unavailable for users other than the owner
// POST EDITING ROUTE
postRouter.patch('/:postid/', )

// unavailable for users other than the owner
// POST DELETE ROUTE
postRouter.delete('/:postid/', )

// COMMENT CREATE ROUTE
postRouter.post('/:postid/postcomment', )

// COMMENT DELETE ROUTE
postRouter.delete('/:postid/:commentid/', )

module.exports = postRouter