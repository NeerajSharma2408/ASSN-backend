const { postClick } = require("../lib/impressionConstants");

const Comment = require("../model/Comment");
const Post = require("../model/Post");
const Reaction = require("../model/Reaction");
const User = require("../model/User");

const { isUsersPostAccessible, hasWriteAccess } = require("../utils/postAuth");
const updatePostImpressions = require("../utils/updatePostImpressions");

const expressAsyncHandler = require('express-async-handler');

// BELOW FUNCTION ADDS USER FIELD IN POST OBJECT BECAUSE AYUSH IS TOO LAZY TO DO HIS WORK :)
const addUserFieldInPost = async (posts) => {
    const userPosts = posts.map(async (post, i)=>{
        const user = await User.findById(post.By).select('Name Username Avatar Bio isPrivateAccount');
        return {post, user};
    })
    const resolvedUserPosts = await Promise.all(userPosts)
    return resolvedUserPosts;
}

const getPosts = expressAsyncHandler(async (req, res) => {
    const userID = req.query.userId ?? res.locals.id;
    const limit = req.query.limit || 18;
    const page = req.query.page || 1;

    if (userID) {
        let Posts = []
        if (userID === res.locals.id) {
            Posts = await Post.find({ By: userID }).select("-Community").skip((page - 1) * limit).limit(limit).exec();
            res.status(200).json({ message: "Posts Found", Posts })
        } else {
            let communityUser = await User.findById(userID).select('-Password -Email -Groups');
            let isUserAccessible = await isUsersPostAccessible(res.locals.id, userID)
            if (communityUser && isUserAccessible) {
                Posts = await Post.find({ $and: [{ "Community": communityUser?.Community }, { "By": userID }] }).select('-Community').skip((page - 1) * limit).limit(limit).exec();

                const userPosts = await addUserFieldInPost(Posts || [])
                res.status(200).json({ message: "User Found", user: communityUser, userPosts })
            } else {
                res.status(400).json({ message: (communityUser ? "Community Mismatched Issue" : "User Not Found"), isUserAccessible })
            }
        }
    } else {
        res.status(400)
        throw new Error("User Id not found")
    }
})

const getCommunityPosts = expressAsyncHandler(async (req, res) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    let userCommunity = await User.findById(res.locals.id).select('Community')
    userCommunity = userCommunity.Community

    let Posts = await Post.find({ Community: userCommunity, isPrivate: false }).select("-Community").sort({ Impressions: -1 }).skip((page - 1) * limit).limit(limit).exec();
    if (Array.isArray(Posts) && Posts.length === 0) {
        res.status(200).json({ message: "There are no Posts currently Associated with your Community", Posts })
    } else {
        const userPosts = await addUserFieldInPost(Posts || [])
        res.status(200).json({ message: "Posts Found", userPosts })
    }
})

const getPost = expressAsyncHandler(async (req, res) => {
    const postID = req.params.postid;

    updatePostImpressions(postID, postClick);
    let post = await Post.findById(postID)

    if (post) {
        const likes = await Reaction.find({ Parent: postID }).select('-Parent').sort({ "timestamp": -1 });
        let totalLikes = likes.length

        const recentLikes = likes.slice(0, 10)

        if (post.By === res.locals.id) {
            res.status(200).json({ message: "Post Found", post, recentLikes, totalLikes })
        } else {
            let isPostAccessibleByUser = await isUsersPostAccessible(res.locals.id, post.By)
            if (isPostAccessibleByUser) {
                const userPost = await addUserFieldInPost([post]);
                res.status(200).json({ message: "Post Found", userPost: userPost[0], likes, totalLikes })
            } else {
                res.status(400).json({ message: "Invalid Request. Post Can't Be Accessed." })
            }
        }
    } else {
        res.status(400).json({ message: "Invalid Request. Post Can't Be Found." })
    }
})

const createPost = expressAsyncHandler(async (req, res) => {
   
    const { caption, attachments, content } = req.body

    const user = await User.findById(res.locals.id).select('_id isPrivateAccount Community')
    let post = {
        Caption: caption,
        MediaURLs: attachments ? attachments : [],
        Content: content,
        By: res.locals.id,
        isPrivate: user.isPrivateAccount,
        Community: user.Community
    }

    post = await Post.create(post)

    if (post.id) {
        res.status(200).json({ message: "Post Created.", post })
    } else {
        res.status(400).json({ message: "Post not Created." })
    }
})

const updatePost = expressAsyncHandler(async (req, res) => {
    const postID = req.params.postid
    const { caption } = req.body

    const userHasWriteAccess = await hasWriteAccess(postID, res.locals.id);

    if(!userHasWriteAccess){
        res.status(400)
        throw new Error("User Doesn't have write permission for this Post")
    }

    const post = await Post.findByIdAndUpdate(postID, { $set: { Caption: caption } }, { new: false })

    if (post) {
        res.status(200).json({ message: "Post updated Successfully.", post })
    } else {
        res.status(400).json({ message: "Post not found." })
    }
})

const deletePost = expressAsyncHandler(async (req, res) => {
    const postID = req.params.postid;

    const userHasWriteAccess = await hasWriteAccess(postID, res.locals.id);

    if(!userHasWriteAccess){
        res.status(400)
        throw new Error("User Doesn't have write permission for this Post")
    }

    const post = await Post.findByIdAndDelete(postID)
    let comments = await Comment.find({ Post: postID }).select('_id') || []
    comments = comments.map(comment => comment._id) 

    let replies = await Comment.find({ Parent: {$in: [...comments]} }).select('_id') || []
    replies = replies.map(reply => reply._id)
    const repliesDeleted = await Comment.deleteMany({ _id: { $in: [...replies, ...comments] } });

    let likes = await Reaction.find({ Parent: { $in: [...replies, ...comments] } }).select('_id') || []
    likes = likes.map(like => like._id)
    const likesDeleted = await Reaction.deleteMany({ _id: { $in: [...likes] } })

    res.status(200).json({ message: "Post Deleted" })
})

module.exports = { getPosts, getCommunityPosts, getPost, createPost, updatePost, deletePost }