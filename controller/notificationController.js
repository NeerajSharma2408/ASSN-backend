const expressAsyncHandler = require("express-async-handler")

const Notification = require('../model/Notification');
const ConnectedUsers = require("../lib/connectedUsers");
const User = require("../model/User");
const Comment = require("../model/Comment");

const getAllNotification = expressAsyncHandler( async (req, res)=>{

    const selfId = res.locals.id;
    const limit = req.query.limit ?? 15;
    const page = req.query.page ?? 1;

    const allNotifications = await Notification.find({To: selfId, isDeleted: false});

    res.status(200).json({message: "ALL NOTIFICATIONS Fetched", allNotifications}).skip((page - 1) * limit).limit(limit).exec();
});

const deleteAllNotification = expressAsyncHandler( async (req, res)=>{

    const selfId = res.locals.id;

    const allNotifications = await Notification.updateMany({To: selfId, isDeleted: false}, {isDeleted: true});
    res.status(200).json({message: "ALL NOTIFICATIONS DELETED", allNotifications})
});

const deleteNotification = expressAsyncHandler( async (req, res)=>{

    const selfId = res.locals.id;
    const notificationId = req.params.notificationId;

    if(!notificationId) throw new Error("notification Id is not Present")

    // mongoose.Types.ObjectId.isValid(any_id) --- to test if id is a valid object_id
    const notificationExists = await Notification.exists({ id: notificationId });

    if(!notificationExists) {
        res.status(404)
        throw new Error("Notification doesn't exists for given Id")
    }

    const deletedNotification = await Notification.findByIdAndUpdate(notificationId, {isDeleted: true});
    res.status(200).json({message: "NOTIFICATION DELETED", deletedNotification})
});

// SOCKET CONTROLLERS
const sendCommentNotification = expressAsyncHandler( async (io, userID, comment, postBy)=>{

    if(comment?.By === userID || !io) return;

    const isReply = comment?.Parent ? true : false;
    const user = await User.findById(userID).select('Name Username id Avatar');
    let message = `${user.Username} has Commented on your Post`;
    io.to(ConnectedUsers[postBy]?.socketId).emit('post-comment-notification', { message, comment, user });

    if(!isReply) return;

    message = `${user.Username} has replied to your Comment`;
    let parentComment = await Comment.findById(comment?.Parent)
    io.to(ConnectedUsers[parentComment?.By]?.socketId).emit('comment-reply-notification', { message, comment, user });
});

const sendReactionNotification = expressAsyncHandler( async (io, userID, reaction, ref, toID)=>{

    if(reaction?.By === userID || !io) return;

    const user = await User.findById(userID).select('Name Username id Avatar');
    let message = `${user.Username} has Reacted to your ${ref}`;
    io.to(ConnectedUsers[toID]?.socketId).emit('reaction-notification', { message, reaction, user, ref });
});

module.exports = { getAllNotification, deleteAllNotification, deleteNotification, sendCommentNotification, sendReactionNotification }