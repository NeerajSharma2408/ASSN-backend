const postRouter = require('express').Router()

// here check if the user's post to be found is the login user or any other user and hence find and return the nessasary details

// GET ALL POST ROUTE (for 1. users{self or commmunity-member} 2. community 3. search)
postRouter.get('/', )

// GET SINGLE POST ROUTE
postRouter.get('/:postid/', )

// unavailable for users other than the owner
// POST EDITING ROUTE
postRouter.patch('/:postid/', )

// unavailable for users other than the owner
// POST DELETE ROUTE
postRouter.delete('/:postid/', )

module.exports = postRouter