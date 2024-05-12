const { getTimeline } = require('../controller/dashboardController')

const dashboardRouter = require('express').Router()

// GET POSTS FOR USER'S TIMELINE
dashboardRouter.get('/', getTimeline)

module.exports = dashboardRouter