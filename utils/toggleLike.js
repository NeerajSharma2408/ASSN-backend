const Comment = require("../model/Comment")
const Post = require("../model/Post")
const Reaction = require("../model/Reaction")
const Message = require("../model/Message")
const { postLike } = require("../lib/impressionConstants")
const updatePostImpressions = require("./updatePostImpressions")

const toggleLike = async (like, parentID, userID, reaction, model) => {
    let response = {}

    let parentExists = true

    switch (model) {
        case "Post":
            parentExists = await Post.exists({'_id': parentID})
            break;
            
        case "Message":
            parentExists = await Message.exists({'_id': parentID})
            break;
            
        case "Comment":
            parentExists = await Comment.exists({'_id': parentID})    
            break;
    
        default:
            parentExists = false;
            break;
    }
    if(!parentExists){
        return false;
    }
    if(like){
        const likePresent = await Reaction.exists({Parent: parentID, By: userID})
        if(likePresent){
            response = await Reaction.findOneAndUpdate({$set: {Reaction: reaction}})
        }else{
            updatePostImpressions(parentID, postLike);
            const likeObj = {
                Parent: parentID,
                By: userID,
                Reaction: reaction,
                onModel: model
            }
            response = await Reaction.create(likeObj)
        }
    }else{
        updatePostImpressions(parentID, -postLike);
        response = await Reaction.findOneAndDelete({By: userID, Parent: parentID})
    }
    return response
}

module.exports = toggleLike