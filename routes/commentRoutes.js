const { getPostComments, getCommentReplies, createComment, toggleCommentLike, deleteComment } = require('../controller/commentController')

const commentRouter = require('express').Router()

// GET POST COMMENTS ROUTE
commentRouter.get('/:postid/comments', getPostComments)

// GET POST COMMENT REPLIES ROUTE
commentRouter.get('/:postid/:comment/replies', getCommentReplies)

// COMMENT CREATE ROUTE
commentRouter.post('/:postid/postcomment', createComment)

// COMMENT LIKE ROUTE
commentRouter.post('/:postid/:commentid/', toggleCommentLike)

// COMMENT DELETE ROUTE
commentRouter.delete('/:postid/:commentid/', deleteComment)

module.exports = commentRouter