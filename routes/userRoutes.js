const { getUser, getProfileCount, getCommunityUsers, searchCommunity, searchFriends, updateProfile } = require('../controller/userController')

const userRouter = require('express').Router()

// SELF PROFILE
userRouter.get('/', getUser)

// GET USER FRIENDS AND POSTS COUNT
userRouter.get('/profile-count/:userID', getProfileCount)

// GET OTHER COMMUNITY USERS PROFILE
userRouter.get('/:userID', getUser)

// GET ALL COMMUNITY USERS
userRouter.get('/community', getCommunityUsers)

// SEARCH COMMUNITY USERS
userRouter.get('/community/:userName', searchCommunity)

// SAERCH USERS'S FRIENDS
userRouter.get('/friends/:userName', searchFriends)

// UPDATE USER PROFILE
userRouter.patch('/updateProfile', updateProfile)

module.exports = userRouter