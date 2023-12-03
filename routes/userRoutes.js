const { getUser, searchCommunity, searchFriends } = require('../controller/userController')

const userRouter = require('express').Router()

// SELF PROFILE
userRouter.get('/', getUser)

// GET OTHER COMMUNITY USERS PROFILE
userRouter.get('/:userID', getUser)

// Search Community Users
userRouter.get('/community/:userName', searchCommunity)

// Search User's Friends
userRouter.get('/friends/:userName', searchFriends)

module.exports = userRouter