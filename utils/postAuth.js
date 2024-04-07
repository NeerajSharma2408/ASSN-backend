const Friend = require("../model/Friend");

const NodeCache = require("node-cache");
const User = require("../model/User");
const Post = require("../model/Post");
const postCache = new NodeCache({ stdTTL: 900, checkperiod: 1000 });

const isUsersPostAccessible = async (userID, communityUserID) => {
    let canAccessUserObject = postCache.get((userID).toString()) || {}

    if (!canAccessUserObject || !canAccessUserObject.hasOwnProperty(communityUserID)) {
        const communnityUser = await User.findById(communityUserID).select('-Password -Email -Groups');
        const user = await User.findById(userID).select('-Password -Email -Groups');

        if(!communnityUser || !user) throw new Error("INTERNAL SERVER ERROR {USER NOT FOUND}");

        const isFriend = await Friend.exists({ $or: [{ Recipient: communityUserID }, { Recipient: userID }, { Requester: communityUserID }, { Requester: userID }] });
        canAccessUserObject[communityUserID] = (communnityUser.Community === user.Community) && (!communnityUser.isPrivateAccount || isFriend)
        postCache.set((userID).toString(), canAccessUserObject, 900)
    }
    return canAccessUserObject[communityUserID]
}

const hasWriteAccess = async (postID, communityUserID) => {  
    if(!mongoose.isValidObjectId(postID)) {
        throw new Error("Invalid Post ID Provided")
    }
    let post = await Post.findById(postID)

    return (post.By.toString() == communityUserID.toString());
}

module.exports = { isUsersPostAccessible, hasWriteAccess }