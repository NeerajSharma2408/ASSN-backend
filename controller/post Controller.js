const { postClick, postLike } = require("../lib/impressionConstants");
const Comment = require("../model/Comment");
const Post = require("../model/Post");
const Reaction = require("../model/Reaction");
const User = require("../model/User");
const { isPostAccessible } = require("../utils/postAuth");
const updatePostImpressions = require("../utils/updatePostImpressions");

const getPosts = async () => {
    const userID = req.params.userID;
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    if (userID) {
        let userCommunity = await User.findById(req.id).select('Community')
        let communityUser = await User.findById(userID).select('Community');
        if (communityUser === userCommunity) {
            const isFriend = await Friend.exist({ $or: [{ Recipient: req.id }, { Recipient: userID }, { Requester: req.id }, { Requester: userID }] });
            communityUser.isFriend = isFriend
            if (isFriend) {
                const Posts = await Post.find({ $and: [{ "Community": userCommunity }, { "By": userID }] }).select('-Community').skip((page - 1) * limit).limit(limit).exec();
                communityUser.Posts = Posts
            } else {
                communityUser.Posts = []
            }
            res.status(200).json({ message: "User Found", user: communityUser, "Community": userCommunity })
        } else {
            res.status(400).json({ message: (communityUser ? "Community Mismatched Issue" : "User Not Found") })
        }
    } else {
        let userCommunity = await User.findById(req.id).select('Community')
        if (!userCommunity)
            res.status(400).json({ message: "User Doesn't Exist. Illegal Request." })
        else {
            const Posts = await Post.find({ $and: [{ "Community": userCommunity }, { "By": user }] }).select('-Community').skip((page - 1) * limit).limit(limit).exec();
            res.status(200).json({ message: "Posts Found", Posts: Posts, "Community": userCommunity })
        }
    }
}

const getCommunityPosts = async () => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    let userCommunity = await User.findById(req.id).select('Community')
    const Posts = await Post.find({ $and: [{ "Community": userCommunity }, { isPrivate: false }] }).select("-Community").sort({ Impressions: -1 }).skip((page - 1) * limit).limit(limit).exec();
    if (Array.isArray(Posts) && Posts.length === 0) {
        res.status(200).json({ message: "There are no Posts currently Associated with your Community", Posts })
    } else {
        res.status().json({ message: "Posts Found", Posts })
    }
}

const getPost = async () => {
    const postID = req.params.postid;

    updatePostImpressions(postID, postClick);
    const post = await Post.findById(postID)

    const likes = await Reaction.find({ Parent: postID }).select('-Parent')
    if (isPostAccessible(req.id, post) && post) {
        res.status(200).json({ message: "Post Found", post, likes })
    } else {
        res.status(400).json({ message: "Invalid Request" })
    }
}

const createPost = async () => {
    const { caption, attachmemts, content } = req.body
    const user = await User.findById(req.id).select('_id isPrivateAccount Community')
    let post = {
        Caption: caption,
        MediaURLs: attachmemts,
        Content: content,
        By: req.id,
        isPrivate: user.isPrivateAccount,
        Community: user.Community
    }

    post = await Post.create(post)

    if(post.id){
        res.status(200).json({message: "Post Created", post})
    }else{
        res.status(500).json({message: "Post not Created. Internal Server Error"})
    }
}

const likePost = async () => {
    const { postID } = req.params;
    const { like, reaction } = req.body;

    updatePostImpressions(postID, like ? postLike : -postLike);
    let response = await toggleLike(like, postID, req.id, reaction, "Post");

    if (response.id) {
        res.status(200).json({ message: "Post Like Toggled" })
    } else {
        res.status(500).json({ message: "Post Like not Toggled. Internal server Error." })
    }
}

const updatePost = async () => {
    const postID = req.params.postid
    const { caption } = req.body

    const post = await Post.findByIdAndUpdate(postID, {$set: {Caption: caption}}, {new: true})

    if(post.id){
        res.status(200).json({message: "Post updated Successfully", post})
    }else{
        res.status(500).json({message: "Post not updated"})
    }
}

const deletePost = async () => {
    const postID = req.params.comment;

    try {
        const post = await Post.findByIdAndDelete(postID)
        const comment = await Comment.deleteMany({ Parent: postID }).select('_id')
        const replies = await Comment.deleteMany({ Parent: { $in: comment } }).select('_id')
        const likes = await Reaction.deleteMany({ Parent: { $in: [...replies, comment, postID] } })

        res.status(200).json({ message: "Comment Deleted" })
    } catch {
        (err) => {
            res.status(500).json({ message: "Comment not Deleted. Internal server Error." })
        }
    }
}

module.exports = { getPosts, getCommunityPosts, getPost, createPost, likePost, updatePost, deletePost }