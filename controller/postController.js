const { postClick } = require("../lib/impressionConstants");

const Comment = require("../model/Comment");
const Friend = require("../model/Friend");
const Post = require("../model/Post");
const Reaction = require("../model/Reaction");
const User = require("../model/User");

const { isUsersPostAccessible } = require("../utils/postAuth");
const toggleLike = require("../utils/toggleLike");
const updatePostImpressions = require("../utils/updatePostImpressions");

const expressAsyncHandler = require('express-async-handler');

const getPosts = expressAsyncHandler(async (req, res) => {
    const userID = req.body.userID;
    const limit = req.query.limit || 18;
    const page = req.query.page || 1;

    let userCommunity = await User.findById(req.id).select('Community');
    userCommunity = userCommunity.Community

    if (userID) {
        let communityUser = await User.findById(userID).select('-Password -Email -Groups');
        if (communityUser?.Community === userCommunity) {
            const isFriend = await Friend.exists({ $or: [{ Recipient: req.id }, { Recipient: userID }, { Requester: req.id }, { Requester: userID }] });
            let Posts = []
            let isUserAccessible = await isUsersPostAccessible(req.id, userID)
            if (isUserAccessible) {
                Posts = await Post.find({ $and: [{ "Community": userCommunity }, { "By": userID }] }).select('-Community').skip((page - 1) * limit).limit(limit).exec();
            }
            res.status(200).json({ message: "User Found", user: communityUser, Posts, isFriend: isFriend ? true : false })
        } else {
            res.status(400).json({ message: (communityUser ? "Community Mismatched Issue" : "User Not Found") })
        }
    } else {
        if (!userCommunity)
            res.status(400).json({ message: "User Doesn't Exist. Illegal Request." })
        else {
            const Posts = await Post.find({ $and: [{ "Community": userCommunity }, { "By": req.id }] }).select('-Community').skip((page - 1) * limit).limit(limit).exec();
            res.status(200).json({ message: "Posts Found", Posts: Posts, "Community": userCommunity })
        }
    }
})

const getCommunityPosts = expressAsyncHandler(async (req, res) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    let userCommunity = await User.findById(req.id).select('Community')
    userCommunity = userCommunity.Community

    const Posts = await Post.find({ Community: userCommunity, isPrivate: false }).select("-Community").sort({ Impressions: -1 }).skip((page - 1) * limit).limit(limit).exec();
    if (Array.isArray(Posts) && Posts.length === 0) {
        res.status(200).json({ message: "There are no Posts currently Associated with your Community", Posts })
    } else {
        res.status(200).json({ message: "Posts Found", Posts })
    }
})

const getPost = expressAsyncHandler(async (req, res) => {
    const postID = req.params.postid;

    updatePostImpressions(postID, postClick);
    const post = await Post.findById(postID)

    if (post) {
        const likes = await Reaction.find({ Parent: postID }).select('-Parent').sort({ "timestamp": -1 });
        let numberOfLikes = likes.length()

        const recentLikes = likes.slice(0, 50)

        if (post.By === req.id) {
            res.status(200).json({ message: "Post Found", post, recentLikes, numberOfLikes })
        } else {
            let isPostAccessibleByUser = await isUsersPostAccessible(req.id, post.By)
            if (isPostAccessibleByUser && post) {
                res.status(200).json({ message: "Post Found", post, likes })
            } else {
                res.status(400).json({ message: "Invalid Request. Post Can't Be Accessed." })
            }
        }
    } else {
        res.status(400).json({ message: "Invalid Request. Post Can't Be Found." })
    }
})

const createPost = expressAsyncHandler(async (req, res) => {
    const { caption, attachmemts, content } = req.body

    const user = await User.findById(req.id).select('_id isPrivateAccount Community')
    let post = {
        Caption: caption,
        MediaURLs: attachmemts ? attachmemts : [],
        Content: content,
        By: req.id,
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

const likePost = expressAsyncHandler(async (req, res) => {
    const { postid } = req.params;
    const { like, reaction } = req.body;

    let response = await toggleLike(like, postid, req.id, reaction, "Post");
    if (response) {
        res.status(200).json({ message: "Post Like Toggled." })
    } else {
        res.status(400).json({ message: "Post Like not Toggled." })
    }
})

const updatePost = expressAsyncHandler(async (req, res) => {
    const postID = req.params.postid
    const { caption } = req.body

    const post = await Post.findByIdAndUpdate(postID, { $set: { Caption: caption } }, { new: true })

    if (post) {
        res.status(200).json({ message: "Post updated Successfully.", post })
    } else {
        res.status(400).json({ message: "Post not found." })
    }
})

const deletePost = expressAsyncHandler(async (req, res) => {
    const postID = req.params.postid;

    const post = await Post.findByIdAndDelete(postID)
    const comment = await Comment.find({ Parent: postID }).select('_id')
    const commentDeleted = await Comment.deleteMany({ Parent: postID }).select('_id')
    const replies = await Comment.find({ Parent: { $in: comment } }).select('_id')
    const repliesDeleted = await Comment.deleteMany({ Parent: { $in: comment } }).select('_id')
    const likes = await Reaction.deleteMany({ Parent: { $in: [...replies, comment, postID] } })

    res.status(200).json({ message: "Post Deleted" })
})

module.exports = { getPosts, getCommunityPosts, getPost, createPost, likePost, updatePost, deletePost }