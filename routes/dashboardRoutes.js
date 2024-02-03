const { getTimeline } = require('../controller/dashboardController')

const dashboardRouter = require('express').Router()

dashboardRouter.get('/', getTimeline)

module.exports = dashboardRouter