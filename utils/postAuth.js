const Friend = require("../model/Friend");

const NodeCache = require("node-cache");
const User = require("../model/User");
const postCache = new NodeCache({ stdTTL: 900, checkperiod: 1000 });

const isUsersPostAccessible = async (userID, communityUserID) => {
    let canAccessUserObject = postCache.get((userID).toString()) || {}

    if (!canAccessUserObject || !canAccessUserObject.hasOwnProperty(communityUserID)) {
        const communnityUser = await User.findById(communityUserID).select('-Password -Email -Groups');
        const user = await User.findById(userID).select('-Password -Email -Groups');

        const isFriend = await Friend.exists({ $or: [{ Recipient: communityUserID }, { Recipient: userID }, { Requester: communityUserID }, { Requester: userID }] });
        canAccessUserObject[communityUserID] = (communnityUser.Community === user.Community) && (!communnityUser.isPrivateAccount || isFriend)
        postCache.set((userID).toString(), canAccessUserObject, 900)
    }
    return canAccessUserObject[communityUserID]
}

module.exports = { isUsersPostAccessible }