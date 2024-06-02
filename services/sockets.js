const { default: mongoose } = require("mongoose");

const Group = require("../model/Group");
const Message = require("../model/Message");
const User = require("../model/User");

const ConnectedUsers = require("../lib/connectedUsers");
const { userHaveMessageWritePermission } = require("../utils/chatAuth");
const Notification = require("../model/Notification");

const populateChatHeads = async(chatHeads) => {
    const populatedChatHeads = Promise.all(chatHeads.map(async(chatHead, i) => {
        const populatedMembers = Promise.all(chatHead.Members.map(async(memberID) => {
            return await User.findById(memberID).select('Name Username Avatar Bio isPrivateAccount');
        }))
        chatHead.Members = await populatedMembers;
        return chatHead
    }))

    return populatedChatHeads
}

const newUserConnected = async (socket, userID, community, toId) => {
    try {
        if (!mongoose.isValidObjectId(userID)) {
            throw new Error("Invalid User ID provided");
        }

        ConnectedUsers[userID] = { community, socketId: socket.id }
        socket.join(community);
        const user = await User.findById(userID);

        user?.Groups?.map((group) => {
            if (group?.hasLeftGroup) return;
            socket.join(group?.GroupID?.toString());
        })

        socket.emit("joined-all-rooms", { message: "groups joined", Groups: user?.Groups });
    } catch (error) {
        console.log(error)
        socket.emit('error', { message: error.message });
    }

    // to send to all members in a room
    // socket.broadcast.to(community).emit('new-user-broadcasted', ({message: ConnectedUsers[userId], userId, "info": "BROADCASTED MESSAGE"}));

    // to send to the given socket id member
    // socket.to(ConnectedUsers[toId]?.socketId).emit('new-user-singleton', ({message: ConnectedUsers[userId], userId, "info": "EMITTED MESSAGE"}));
};

const getChatHeads = async (socket, userID, limit, page) => {
    try {
        if (!mongoose.isValidObjectId(userID)) {
            throw new Error("Invalid User ID provided");
        }

        const user = await User.findById(userID);
        const grpArray = user.Groups.map((group, i) => (group?.GroupID));
        const chatHeads = await Group.find({ _id: { $in: grpArray } }).skip((page - 1) * limit).limit(limit).exec();

        const populatedChatHeads = await populateChatHeads(chatHeads);

        // const allChatHeads = await Group.find({ Members: { $eq: userID } }).skip((page - 1) * limit).limit(limit).exec();

        socket.emit("chat-heads-fetched", { message: "ALL CHAT HEAD FOUND", populatedChatHeads })
    } catch (error) {
        console.log(error)
        socket.emit('error', { message: error.message });
    }
};

const getChatMessages = async (socket, userID, groupID, limit, page) => {
    try {
        if (!mongoose.isValidObjectId(userID) || !mongoose.isValidObjectId(groupID)) {
            throw new Error("Invalid User Id or Group Id provided");
        }

        const group = await Group.exists({ _id: groupID });
        if (!group) {
            throw new Error("Group doesn't Exist");
        }

        const messages = await Message.find({ InGroup: groupID, isDeleted: false }).skip((page - 1) * limit).limit(limit).exec();

        socket.emit("chat-messages-fetched", { message: "ALL CHAT MESSAGES FOUND", messages })
    } catch (error) {
        console.log(error)
        socket.emit('error', { message: error.message });
    }
};

const createGroup = async (socket, createdBy, memberIDs, message, Name) => {
    try {
        memberIDs?.map(memberID=>{
            if (!mongoose.isObjectIdOrHexString(memberID)) {
                throw new Error("Invalid Member Id provided");
            }
        });

        let group = await Group.findOne({ isGroupChat: false, Members: { 
            $all: memberIDs, 
            $size: memberIDs.length
        } });

        if(!group){
            if (!mongoose.isObjectIdOrHexString(createdBy)) {
                throw new Error("Invalid Created By Id provided");
            }
            let createdByUser = await User.findById(createdBy);
    
            let groupObj = {
                Members: memberIDs,
                Name: Name ?? (memberIDs.length > 2 ? createdByUser.Username+"'s Group" : null),
                CreatedBy: createdByUser.id,
                isGroupChat: memberIDs.length > 2
            }
            group = await Group.create(groupObj);
    
            if(!group) throw new Error("Unable to create Group");

            memberIDs?.map(async (memberID)=>{
                const user = await User.findByIdAndUpdate(memberID, { $push: {Groups: {GroupID: group.id}} });
                const notificationDoc = await Notification.create({
                    From: createdBy,
                    To: memberID,
                    Type: 8,
                    RefObject: {
                        RefSchema: 'GROUP',
                        RefId: group.id
                    },
                    Message: `You have been added to a group by ${createdByUser.Username}`
                });
                socket.to(ConnectedUsers[memberID]?.socketId).emit("added-to-group", { message: "YOU HAVE BEEN ADDED TO A GROUP", group, notificationDoc });
            });
        }
        
        if(message) sendMessage(socket, message, createdBy, group.id);

        return group;

    } catch (error) {
        console.log(error)
        socket.emit('error', { message: error.message });
    }
};

const leaveGroup = async (socket, userID, groupID, removedBy) => {
    try {
        if (!mongoose.isValidObjectId(userID) || !mongoose.isValidObjectId(groupID) || !mongoose.isValidObjectId(removedBy)) {
            throw new Error("Invalid User Id or Group Id provided");
        }

        let removedByUser = null;
        if(userID !== removedBy){
            removedByUser = await User.findById(removedBy);
        }
        let removedUser = await User.findById(userID);

        let group = await Group.findById(groupID);
        if (!group || !removedUser) {
            throw new Error("Group or User doesn't Exist");
        }
        
        group = await Group.findByIdAndUpdate(group.id, { $pull: { Members: removedUser.id } });
        removedUser = await User.findByIdAndUpdate(userID, { $pull: { Group: groupID } });

        let notificationDoc = null;
        if(removedByUser){
            notificationDoc = await Notification.create({
                From: removedByUser.id,
                To: removedUser.id,
                Type: 9,
                RefObject: {
                    RefSchema: 'Group',
                    RefId: group.id
                },
                Message: `You have been removed from the group ${group.Name} by ${createdByUser.Username}`
            });
        }

        socket.leave(groupID);
        
        socket.to(groupID).emit("left-group", { message: removedByUser ? `${removedUser.Username} have been removed by ${removedByUser.Username}` : `You have left the group`, group, removedUser, removedByUser, notificationDoc });

    } catch (error) {
        console.log(error)
        socket.emit('error', { message: error.message });
    }
};

const deleteGroup = async (socket, userID, groupID) => {
    try {
        leaveGroup(socket, userID, groupID, userID);
        
        const user = await User.updateOne({id: userID, 'Groups.GroupID': groupID }, { $set : { 'Groups.$.hasDeletedGroup': true }})

    } catch (error) {
        console.log(error)
        socket.emit('error', { message: error.message });
    }
};

const sendMessage = async (socket, message, userID, groupID, replyTo) => {
    try {
        if (!mongoose.isValidObjectId(userID) || !mongoose.isValidObjectId(groupID)) {
            throw new Error("Invalid User Id or Group Id or To User Id provided");
        }

        let group = await Group.findById(groupID);
        if(!group){
            group = createGroup(socket, userID, [userID, groupID], message);
            return;
        }

        const sender = await User.findById(userID);

        if (!sender) {
            throw new Error("Users doesn't Exist");
        }

        let messageObj = {
            Sender: sender.id,
            Receiver: groupID,
            Message: message,
            Parent: replyTo ?? null,
            InGroup: groupID
        }

        const messageDoc = await Message.create(messageObj);
        
        if(!messageDoc) throw new Error("Unable to send Message");

        group = await Group.findByIdAndUpdate(groupID, { $set: {LastUpdation: {By: userID, Message: messageDoc.id}} });

        // HERE CREATE A NOTIFICTAION SCHEMA ENRTY FOR MESSAGE RECEIEVED
        socket.broadcast.to(groupID).emit("message-received", { message: "MESSAGE RECEIVED", messageDoc });

    } catch (error) {
        console.log(error);
        socket.emit('error', { message: error.message });
    }
};

const updateMessage = async (socket, message, messageID, userID, groupID) => {
    try {
        if (!mongoose.isValidObjectId(userID) || !mongoose.isValidObjectId(groupID) || !mongoose.isValidObjectId(messageID)) {
            throw new Error("Invalid User Id or Group Id or Message Id provided");
        }

        if(!userHaveMessageWritePermission(userID, groupID, messageID)){
            throw new Error("User doesn't have permission to Update Message");
        }

        const messageDoc = await Message.findByIdAndUpdate(messageID, { $set: {Message: message, isUpdated: true} });

        socket.to(groupID).emit("message-updated", { message: "MESSAGE UPDATED", messageDoc });

    } catch (error) {
        console.log(error)
        socket.emit('error', { message: error.message });
    }
};

const deleteMessage = async (socket, messageID, userID, groupID) => {
    try {
        if (!mongoose.isValidObjectId(userID) || !mongoose.isValidObjectId(groupID) || !mongoose.isValidObjectId(messageID)) {
            throw new Error("Invalid User Id or Group Id or Message Id provided");
        }

        if(!userHaveMessageWritePermission(userID, groupID, messageID)){
            throw new Error("User doesn't have permission to Delete Message");
        }

        const messageDoc = await Message.findByIdAndUpdate(messageID, { $set: {isDeleted: true} });

        socket.to(groupID).emit("message-deleted", { message: "MESSAGE DELETED", messageDoc });

    } catch (error) {
        console.log(error)
        socket.emit('error', { message: error.message });
    }
};

const disconnected = async (socket) => {
    try {
        for (const key in ConnectedUsers) {
            if (ConnectedUsers[key]?.socketId === socket.id) {
                delete ConnectedUsers[key];
                break;
            }
        }
        console.log('user disconnected');
    } catch (error) {
        console.log(error)
        socket.emit('error', { message: error.message });
    }
};

module.exports = { newUserConnected, getChatHeads, getChatMessages, createGroup, leaveGroup, deleteGroup, sendMessage, updateMessage, deleteMessage, disconnected }