const { getUser, searchCommunity, searchFriends, updateProfile } = require('../controller/userController')

const userRouter = require('express').Router()

// SELF PROFILE
userRouter.get('/', getUser)

// GET OTHER COMMUNITY USERS PROFILE
userRouter.get('/:userID', getUser)

// Search Community Users
userRouter.get('/community/:userName', searchCommunity)

// Search User's Friends
userRouter.get('/friends/:userName', searchFriends)

// Update User Profile

userRouter.patch('/updateProfile', updateProfile)

module.exports = userRouter