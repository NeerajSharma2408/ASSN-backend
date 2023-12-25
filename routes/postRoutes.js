const { getPosts, getCommunityPosts, getPost, createPost, likePost, updatePost, deletePost } = require('../controller/postController')

const postRouter = require('express').Router()

// here check if the user's post to be found is the login user or any other user and hence find and return the nessasary details

// GET ALL POST ROUTE (for users{self or commmunity-member})
postRouter.get('/', getPosts)

// GET ALL POST ROUTE (for community)
postRouter.get('/community/', getCommunityPosts)

// GET SINGLE POST ROUTE
postRouter.get('/:postid/', getPost)

// CREATE POST ROUTE
postRouter.post('/', createPost)

// TOOGLE POST LIKE ROUTE
postRouter.post('/:postid/react', likePost)

// unavailable for users other than the owner
// POST EDITING ROUTE
postRouter.patch('/:postid/', updatePost)

// unavailable for users other than the owner
// POST DELETE ROUTE
postRouter.delete('/:postid/', deletePost)

module.exports = postRouter