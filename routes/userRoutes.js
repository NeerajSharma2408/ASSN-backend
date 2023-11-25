const userRouter = require('express').Router()

// here check if the user to be found is the login user or any other user and hence find and return the nessasary details
// PROFILE PAGE ROUTES
userRouter.get('/', )

// here check if the user's post to be found is the login user or any other user and hence find and return the nessasary details
// POST DETAILS ROUTE
userRouter.get('/:postid/', )

// unavailable for users other than the owner
// POST EDITING ROUTE
userRouter.patch('/:postid/', )

// unavailable for users other than the owner
// POST DELETE ROUTE
userRouter.delete('/:postid/', )

// COMMENT CREATE ROUTE
userRouter.post('/:postid/postcomment', )

// COMMENT DELETE ROUTE
userRouter.delete('/:postid/:commentid/', )

module.exports = userRouter