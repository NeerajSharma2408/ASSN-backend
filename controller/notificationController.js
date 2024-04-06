const expressAsyncHandler = require("express-async-handler")

const Notification = require('../model/Notification')

const getAllNotification = expressAsyncHandler( async (req, res)=>{
    res.status(200).json({message: "ALL NOTIFICATIONS"})
})

module.exports = { getAllNotification }