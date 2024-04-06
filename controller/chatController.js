const expressAsyncHandler = require("express-async-handler")

const Message = require('../model/Message')

const getAllMessages = expressAsyncHandler( async (req, res)=>{
    res.status(200).json({message: "ALL MESSAGES"})
})

module.exports = { getAllMessages }