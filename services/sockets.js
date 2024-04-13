const { default: mongoose } = require("mongoose");

const Group = require("../model/Group");
const Message = require("../model/Message");
const User = require("../model/User");

const ConnectedUsers = require("../lib/connectedUsers");

const newUserConnected = async ({ socket, userID, community, toId }) => {
    try {
        if(!mongoose.isValidObjectId(userID)){
            throw new Error("Invalid User ID provided");
        }
    
        ConnectedUsers[userID] = { community, socketId: socket.id }
        socket.join(community);
        const user = await User.findById(userID);
    
        user?.Groups?.map((group)=>{
            if(group?.hasLeftGroup) return;
            socket.join(group.GroupID);
        })
    
        socket.emit("commentsSeen", {message: "groups joined"});
    } catch (error) {
        console.log(error)
        socket.emit('error', {message: error.message});
    }

    // to send to all members in a room
    // socket.broadcast.to(community).emit('new-user-broadcasted', ({message: ConnectedUsers[userId], userId, "info": "BROADCASTED MESSAGE"}));

    // to send to the given socket id member
    // socket.to(ConnectedUsers[toId]?.socketId).emit('new-user-singleton', ({message: ConnectedUsers[userId], userId, "info": "EMITTED MESSAGE"}));
};

const getChatHeads = async (socket, userID, limit, page)=>{
    try {
        if(!mongoose.isValidObjectId(userID)){
            throw new Error("Invalid User ID provided");
        }
    
        const user = await User.findById(userID);
        const chatHeads = await Group.find({id: { $in: user.Groups }}).skip((page - 1) * limit).limit(limit).exec();
    
        // const allChatHeads = await Group.find({ Members: { $eq: userID } }).skip((page - 1) * limit).limit(limit).exec();
    
        socket.emit("chat-heads-fetched", {message: "ALL CHAT HEAD FOUND", chatHeads})
    } catch (error) {
        console.log(error)
        socket.emit('error', {message: error.message});
    }
};

const getChatMessages = async (socket, userID, groupID, limit, page) => {
    try {
        if(!mongoose.isValidObjectId(userID) || !mongoose.isValidObjectId(groupID)){
            throw new Error("Invalid User Id or Group Id provided");
        }

        const group = await Group.exists({_id: groupID});
        if(!group){
            throw new Error("Group doesn't Exist");
        }

        const messages = await Message.find({InGroup: groupID, isDeleted: false}).skip((page - 1) * limit).limit(limit).exec();

        socket.emit("chat-messages-fetched", {message: "ALL CHAT MESSAGES FOUND", messages})
    } catch (error) {
        console.log(error)
        socket.emit('error', {message: error.message});
    }
};

const disconnected = async (socket) => {
    try {
        for (const key in ConnectedUsers) {
            if(ConnectedUsers[key]?.socketId === socket.id){
                delete ConnectedUsers[key];
                break;
            }
        }
        console.log('user disconnected');
    } catch (error) {
        console.log(error)
        socket.emit('error', {message: error.message});
    }
};

module.exports = { newUserConnected, getChatHeads, getChatMessages, disconnected }