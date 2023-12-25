const Reaction = require("../model/Reaction")

const toggleLike = async (like, commentID, userID, reaction, model) => {
    if(like){
        const likeObj = {
            Parent: commentID,
            By: req.id,
            Reaction: reaction,
            onModel: model
        }
    
        response = await Reaction.create(likeObj)
    }else{
        response = await Reaction.findOneAndDelete({By: userID, Parent: commentID})
    }
}

module.exports = toggleLike