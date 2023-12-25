const Friend = require("../model/Friend");
const Post = require("../model/Post");

const NodeCache = require("node-cache");
const User = require("../model/User");
const postCache = new NodeCache({ stdTTL: 900, checkperiod: 1000 });

const isPostAccessible = async (userID, postID, post) => {
    let canAccessPostObject = postCache.get((userID).toString()) || {}
    if (!post) {
        post = await Post.findById(postID)
    }
    if (!canAccessPostObject || !canAccessPostObject.hasOwnProperty(post.id)) {
        const userCommunity = await User.findById(userID).select('Community');
        const isFriend = await Friend.exists({ $or: [{ Recipient: post.id }, { Recipient: userID }, { Requester: post.id }, { Requester: userID }] });
        canAccessPostObject[post.id] = (userCommunity.Community === post.Community) && (!post.isPrivate || (post.isPrivate && isFriend))
        postCache.set((userID).toString(), canAccessPostObject, 900)
    }
    return canAccessPostObject[post.id]
}

module.exports = { isPostAccessible }