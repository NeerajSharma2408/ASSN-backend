const Friend = require("../model/Friend");
const Post = require("../model/Post");

const NodeCache = require("node-cache");
const postCache = new NodeCache({ stdTTL: 900, checkperiod: 1000 });

const isPostAccessible = async (userID, post) => {
    let canAccessPostObject = postCache.get(userID)
    if (!post) {
        post = await Post.findById(postID)
    }
    if (!canAccessPostObject || !canAccessPostObject.hasOwnProperty(post.id)) {
        const userCommunity = await User.findById(userID).select('Community');
        const isFriend = await Friend.exist({ $or: [{ Recipient: post.id }, { Recipient: userID }, { Requester: post.id }, { Requester: userID }] });
        canAccessPostObject[post.id] = (userCommunity === post.Community) && (!post.isPrivate || (post.isPrivate && isFriend))
        postCache.set(req.id, canAccessPostObject, 900)
    }else{
        return canAccessPostObject[post.id]
    }
}

module.exports = { isPostAccessible }