const expressAsyncHandler = require("express-async-handler")

const Reaction = require("../model/Reaction")

const updatePostImpressions = require("../utils/updatePostImpressions")

const { postLike, commentLike } = require("../lib/impressionConstants")

const Post = require("../model/Post")
const Message = require("../model/Message")
const Comment = require("../model/Comment")
const User = require("../model/User")

const toggleReaction = expressAsyncHandler(async (req, res) => {
    const parentID = req.params.parentId
    const userID = res.locals.id

    const { like, reaction, model } = req.body

    let parentExists = true

    let impression = 0
    switch (model) {
        case "Post":
            impression = postLike
            parentExists = await Post.exists({'_id': parentID})
            break;
            
            case "Message":
            parentExists = await Message.exists({'_id': parentID})
            break;
            
            case "Comment":
            impression = commentLike
            parentExists = await Comment.exists({'_id': parentID})    
            break;
    
        default:
            parentExists = false;
            break;
    }

    if(!parentExists){
        res.status(404)
        throw new Error("Parent Not found")
    }else{
        const likePresent = await Reaction.exists({Parent: parentID, By: userID})
        if(like){
            if(likePresent){
                response = await Reaction.findOneAndUpdate({Parent: parentID, By: userID}, {$set: {Reaction: reaction}})
            }else{
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
            }
        }else{
            if(likePresent){
                updatePostImpressions(parentID, -impression);
                response = await Reaction.findOneAndDelete({By: userID, Parent: parentID})
            }
        }
        res.status(200).json({message: "Reaction Toggled"})
    }
})

const getReactions = expressAsyncHandler(async (req, res) => {
    const parentId = req.params.parentId

    const limit = req.query.limit || 50;
    const page = req.query.page || 1;

    const likes = await Reaction.find({Parent: parentId}).skip((page-1)*limit).limit(limit).exec();

    res.status(200).json({message: "Reactions Found", likes})
})

module.exports = { toggleReaction, getReactions }