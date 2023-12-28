const { getPostComments, createComment, updateComment, deleteComment } = require('../controller/commentController')

const commentRouter = require('express').Router()

commentRouter.route('/:parentId/')

    // GET POST COMMENTS ROUTE // GET POST COMMENT REPLIES ROUTE
    .get(getPostComments)

    // COMMENT CREATE ROUTE
    .post(createComment)


commentRouter.route('/:parentId/:commentId/')

    // COMMENT UPDATE ROUTE
    .patch(updateComment)

    // COMMENT DELETE ROUTE
    .delete(deleteComment)

module.exports = commentRouter