const expressAsyncHandler = require("express-async-handler")
const Post = require("../model/Post")
const Friend = require("../model/Friend")

const getTimeline = expressAsyncHandler( async(req, res) => {
    const userId = res.locals.id;
    const friends = await Friend.find({$and: [{status: 3}, {$or: [{Requester: userId}, {Recipient: userId}]}]}).select('id');
    const friendsId = friends.map(friend => { return friend.id } );
    const posts = await Post.find({By: {$in: friendsId}}).select('-Community').sort({Impressions: -1});

    if(!posts || Array.isArray(posts) && posts.length === 0){
        res.status(404);
        throw new Error('No Posts Found');
    };
    res.status(200).json({message: 'Posts Found', posts})
})

module.exports = { getTimeline }