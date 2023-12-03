const commentRouter = require('express').Router()

// COMMENT GET ROUTE
commentRouter.post('/:postid/', )

// COMMENT CREATE ROUTE
commentRouter.post('/:postid/postcomment', )

// COMMENT DELETE ROUTE
commentRouter.delete('/:postid/:commentid/', )

// COMMENT LIKE ROUTE
commentRouter.post('/:postid/:commentid/', )

module.exports = commentRouter