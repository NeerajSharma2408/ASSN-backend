const expressAsyncHandler = require("express-async-handler")

const Reaction = require("../model/Reaction")

const updatePostImpressions = require("../utils/updatePostImpressions")

const { postLike, commentLike } = require("../lib/impressionConstants")

const Post = require("../model/Post")
const Message = require("../model/Message")
const Comment = require("../model/Comment")
const User = require("../model/User")
const { default: mongoose } = require("mongoose")
const { sendReactionNotification } = require("./notificationController")

const toggleReaction = expressAsyncHandler(async (req, res) => {
    const parentID = req.params.parentId
    const userID = res.locals.id

    const { like, reaction, model } = req.body

    if (parentID && !mongoose.isValidObjectId(parentID)) {
        res.status(400);
        throw new Error("Invalid Parent Id sent");
    }

    let parentDoc = null;

    let impression = 0
    switch (model) {
        case "Post":
            impression = postLike
            parentDoc = await Post.findById(parentID)
            break;
        case "Message":
            parentDoc = await Message.findById(parentID)
            break;
        case "Comment":
            impression = commentLike
            parentDoc = await Comment.findById(parentID)
            break;
        default:
            parentDoc = false;
            break;
    }

    if (!parentDoc) {
        res.status(404)
        throw new Error("Parent Not found")
    }
    const likePresent = await Reaction.exists({ Parent: parentID, By: userID })
    let response = null;
    if (like) {
        if (likePresent) {
            response = await Reaction.findOneAndUpdate({ Parent: parentID, By: userID }, { $set: { Reaction: reaction } })
        } else {
            const userAvatar = await User.findById(res.locals.id).select("Avatar")
            updatePostImpressions(parentID, +impression);
            const likeObj = {
                Parent: parentID,
                By: userID,
                Reaction: reaction,
                onModel: model,
                Avatar: userAvatar.Avatar
            }
            response = await Reaction.create(likeObj)
            let docObj = null;
            switch (model) {
                case "Post": 
                    docObj = await Post.findByIdAndUpdate(parentID, {$inc: {CommentsCount: 1}}).exec();
                    break;
                case "Message":
                    docObj = await Message.findByIdAndUpdate(parentID, {$inc: {CommentsCount: 1}}).exec();
                    break;
                case "Comment":
                    docObj = await Comment.findByIdAndUpdate(parentID, {$inc: {CommentsCount: 1}}).exec();
                    break;
                default: console.log("INVALID CASE")
            }
        }
        sendReactionNotification(req?.app?.io, res?.locals?.id, response, model, parentDoc?.By ?? parentDoc?.Sender);
    } else {
        if (likePresent) {
            updatePostImpressions(parentID, -impression);
            response = await Reaction.findOneAndDelete({ By: userID, Parent: parentID })
            let docObj = null;
            switch (model) {
                case "Post": 
                    docObj = await Post.findByIdAndUpdate(parentID, {$inc: {CommentsCount: -1}}).exec();
                    break;
                case "Message":
                    docObj = await Message.findByIdAndUpdate(parentID, {$inc: {CommentsCount: -1}}).exec();
                    break;
                case "Comment":
                    docObj = await Comment.findByIdAndUpdate(parentID, {$inc: {CommentsCount: -1}}).exec();
                    break;
                default: console.log("INVALID CASE");
            }
        }
    }
    res.status(200).json({ message: "Reaction Toggled", response })
})

const getReactions = expressAsyncHandler(async (req, res) => {
    const parentId = req.params.parentId

    const limit = req.query.limit || 50;
    const page = req.query.page || 1;

    const likes = await Reaction.find({ Parent: parentId }).skip((page - 1) * limit).limit(limit).exec();

    res.status(200).json({ message: "Reactions Found", likes })
})

module.exports = { toggleReaction, getReactions }