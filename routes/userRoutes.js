const { getUser, searchCommunity, searchFriends, updateProfile } = require('../controller/userController')

const userRouter = require('express').Router()

// SELF PROFILE
userRouter.get('/', getUser)

// GET OTHER COMMUNITY USERS PROFILE
userRouter.get('/:userID', getUser)

// SEARCH COMMUNITY USERS
userRouter.get('/community/:userName', searchCommunity)

// SAERCH USERS'S FRIENDS
userRouter.get('/friends/:userName', searchFriends)

// UPDATE USER PROFILE
userRouter.patch('/updateProfile', updateProfile)

module.exports = userRouter