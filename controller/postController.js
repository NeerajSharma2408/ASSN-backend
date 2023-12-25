const { postClick, postLike } = require("../lib/impressionConstants");
const Comment = require("../model/Comment");
const Friend = require("../model/Friend");
const Post = require("../model/Post");
const Reaction = require("../model/Reaction");
const User = require("../model/User");
const { isPostAccessible } = require("../utils/postAuth");
const toggleLike = require("../utils/toggleLike");
const updatePostImpressions = require("../utils/updatePostImpressions");

const getPosts = async (req, res) => {
    const userID = req.body.userID;
    const limit = req.query.limit || 18;
    const page = req.query.page || 1;

    try {
        let userCommunity = await User.findById(req.id).select('Community');
        userCommunity = userCommunity.Community

        if (userID) {
            let communityUser = await User.findById(userID).select('-Password -Email -Groups');
            if (communityUser?.Community === userCommunity) {
                const isFriend = await Friend.exists({ $or: [{ Recipient: req.id }, { Recipient: userID }, { Requester: req.id }, { Requester: userID }] });
                let Posts = []
                if (isFriend) {
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
    } catch (error) {
        console.log("Error: ", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const getCommunityPosts = async (req, res) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    try {
        let userCommunity = await User.findById(req.id).select('Community')
        userCommunity = userCommunity.Community

        const Posts = await Post.find({ Community: userCommunity, isPrivate: false }).select("-Community").sort({ Impressions: -1 }).skip((page - 1) * limit).limit(limit).exec();
        if (Array.isArray(Posts) && Posts.length === 0) {
            res.status(200).json({ message: "There are no Posts currently Associated with your Community", Posts })
        } else {
            res.status(200).json({ message: "Posts Found", Posts })
        }
    } catch (error) {
        console.log("Error: ", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const getPost = async (req, res) => {
    const postID = req.params.postid;

    try {
        updatePostImpressions(postID, postClick);
        const post = await Post.findById(postID)

        if (post) {
            const likes = await Reaction.find({ Parent: postID }).select('-Parent')
            let isPostAccessibleByUser = await isPostAccessible(req.id, postID, post)
            if (isPostAccessibleByUser && post) {
                res.status(200).json({ message: "Post Found", post, likes })
            } else {
                res.status(400).json({ message: "Invalid Request. Post Can't Be Accessed." })
            }
        } else {
            res.status(400).json({ message: "Invalid Request. Post Can't Be Found." })
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error." })
    }
}

const createPost = async (req, res) => {
    const { caption, attachmemts, content } = req.body

    try {
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
    } catch (error) {
        console.log("Errro: ", error)
        res.status(500).json({ message: "Internal Server Error." })
    }
}

const likePost = async (req, res) => {
    const { postid } = req.params;
    const { like, reaction } = req.body;

    try {
        updatePostImpressions(postid, like ? postLike : -postLike);
        let response = await toggleLike(like, postid, req.id, reaction, "Post");
        if (response) {
            res.status(200).json({ message: "Post Like Toggled." })
        } else {
            res.status(400).json({ message: "Post Like not Toggled." })
        }
    } catch (error) {
        console.log("Errro: ", error)
        res.status(500).json({ message: "Internal Server Error." })
    }
}

const updatePost = async (req, res) => {
    const postID = req.params.postid
    const { caption } = req.body

    try {
        const post = await Post.findByIdAndUpdate(postID, { $set: { Caption: caption } }, { new: true })

        if (post) {
            res.status(200).json({ message: "Post updated Successfully.", post })
        } else {
            res.status(400).json({ message: "Post not found." })
        }
    } catch (error) {
        console.log("Errro: ", error)
        res.status(500).json({ message: "Internal Server Error." })
    }
}

const deletePost = async (req, res) => {
    const postID = req.params.postid;

    try {
        const post = await Post.findByIdAndDelete(postID)
        const comment = await Comment.find({ Parent: postID }).select('_id')
        const commentDeleted = await Comment.deleteMany({ Parent: postID }).select('_id')
        if (commentDeleted.deletedCount > 0) {
            const replies = await Comment.find({ Parent: { $in: comment } }).select('_id')
            const repliesDeleted = await Comment.deleteMany({ Parent: { $in: comment } }).select('_id')
            if (repliesDeleted.deletedCount > 0) {
                const likes = await Reaction.deleteMany({ Parent: { $in: [...replies, comment, postID] } })
            }
        }

        res.status(200).json({ message: "Post Deleted" })
    } catch (error) {
        console.log("Error: ", error)
        res.status(500).json({ message: "Post not Deleted. Internal server Error." })
    }
}

module.exports = { getPosts, getCommunityPosts, getPost, createPost, likePost, updatePost, deletePost }