const expressAsyncHandler = require("express-async-handler")

const Message = require('../model/Message')
const Group = require('../model/Group')

const getAllChatHeads = expressAsyncHandler( async (req, res)=>{

    const selfId = res.locals.id;
    const limit = req.query.limit ?? 15;
    const page = req.query.page ?? 1;

    const allChatHeads = await Group.find({ Members: { $eq: selfId } }).skip((page - 1) * limit).limit(limit).exec();

    res.status(200).json({message: "ALL CHAT HEAD FOUND", allChatHeads});
})

const getAllMessage = expressAsyncHandler( async (req, res) => {

    const selfId = res.locals.id;
    const groupId = req.params.groupId;
    const limit = req.query.limit ?? 50;
    const page = req.query.page ?? 1;

    if(!groupId) {
        res.status(404)
        throw new Error("Group id Not Present")
    }
    
    const group = await Group.exists({_id: groupId});
    
    if(!group){
        res.status(400)
        throw new Error("Group does Not Exist for given Group Id")
    }

    const messages = await Message.find({InGroup: groupId, isDeleted: false}).skip((page - 1) * limit).limit(limit).exec();

    res.status(200).json({message: "ALL MESSAGES FETCHED", messages})
})

module.exports = { getAllChatHeads, getAllMessage }