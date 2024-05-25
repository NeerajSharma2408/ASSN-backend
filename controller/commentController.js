const { getPostComment, getPostCommentReplies, postComment, commentLike } = require("../lib/impressionConstants");
const Comment = require("../model/Comment");
const Post = require("../model/Post");
const Reaction = require("../model/Reaction");
const User = require("../model/User");

const { isUsersPostAccessible } = require("../utils/postAuth");

const expressAsyncHandler = require('express-async-handler');
const updatePostImpressions = require("../utils/updatePostImpressions");
const { sendCommentNotification } = require("./notificationController");
const { default: mongoose } = require("mongoose");

const getPostComments = expressAsyncHandler(async (req, res) => {
    const postID = req.params.parentId;
    const commentID = req.query.commentId; // TO GET REPLIES TO A PARTICULAR COMMENT

    const post = await Post.findById(postID);

    if (post) {
        const userID = post.By;
        const limit = req.query.limit || 25;
        const page = req.query.page || 1;

        const canAccessComments = await isUsersPostAccessible(res.locals.id, userID);

        if (canAccessComments) {
            let comments = await Comment.find({ Post: postID, Parent: commentID || null }).select('-Post').skip((page - 1) * limit).limit(limit).exec();
            updatePostImpressions(postID, commentID ? getPostCommentReplies : getPostComment);
            let allComments = Promise.all(comments.map(async (comment) => {
                const totalLikes = await Reaction.countDocuments({ Parent: comment.id });
                const totalReplies = await Comment.countDocuments({ Post: postID, Parent: comment.id });
                return { comment, totalLikes, totalReplies }
            }))
            comments = await allComments;

            // FOR TESTING PURPOSE
            // BROADCAST TO ONE USER
            // req.app.io.to(ConnectedUsers[userID]?.socketId).emit('commentsSeen', {message: `SomeOne ${res.locals.id} Viewed your posts comment`, comments})

            // BROADCAST TO ALL USERS IN A ROOM EXCEPT CURRENT USER
            // req.app.io.to(ConnectedUsers[userID]?.community).except(ConnectedUsers[userID]?.socketId).emit('hazratHazratHazrat', {message: `${res.locals.id} Viewed ${post.By} posts comment`, comments})

            res.status(200).json({ message: "Comments Found", comments })
        } else {
            res.status(400).json({ message: "No Comments Found or not Authorized to view Post" })
        }
    } else {
        res.status(404).json({ message: "Post Not Found" })
    }
})

const createComment = expressAsyncHandler(async (req, res) => {
    const postID = req.params.parentId;
    let commentId = req.query.commentId; // TO CREATE REPLIES TO A PARTICULAR COMMENT
    const message = req.body.message;

    const post = await Post.findById(postID);
    
    if (post) {
        const userID = post.By;
        
        const canAccessPost = await isUsersPostAccessible(res.locals.id, userID);
        
        if (canAccessPost) {
            const user = await User.findById(res.locals.id).select("Avatar");

            if(commentId && !mongoose.isValidObjectId(commentId)){
                throw new Error("INVALID COMMENT ID SENT")
            }
            
            const comment = {
                Post: postID,
                By: res.locals.id,
                Parent: commentId ?? null,
                Message: message,
                Avatar: user.Avatar
            }
        
            const response = await Comment.create(comment);
            
            sendCommentNotification(req?.app?.io, res.locals.id, response, post.By);
            
            updatePostImpressions(postID, postComment);
            const post = await Post.findByIdAndUpdate(postID, {$inc: {CommentsCount: 1}}).exec();

            res.status(200).json({ message: "Comment Created", response })
        } else {
            res.status(400).json({ message: "Not Authorized to view Post" })
        }
    } else {
        res.status(404).json({ message: "Post Not Found" })
    }
})

const updateComment = expressAsyncHandler(async (req, res) => {
    const postID = req.params.parentId;
    const commentID = req.params.commentId;

    const message = req.body.message;

    if(!mongoose.isValidObjectId(postID) || !mongoose.isValidObjectId(commentID)) {
        throw new Error("Invalid Post or Comment ID Provided")
    }

    const post = await Post.findById(postID);
    
    if (post) {
        const userID = post.By;

        const comment = await Comment.findById(commentID);

        if(comment.By.toString() != res.locals.id.toString()){
            res.status(400)
            throw new Error("User Doesn't have write permission for this Comment")
        }
        
        const canAccessPost = await isUsersPostAccessible(res.locals.id, userID);
        
        if (canAccessPost) {
            const comment = await Comment.findByIdAndUpdate(commentID, { $set: { Message: message } }, { new: false });

            res.status(200).json({ message: "Comment Created", comment })
        } else {
            res.status(400).json({ message: "Not Authorized to view Post" })
        }
    } else {
        res.status(404).json({ message: "Post Not Found" })
    }
})

const deleteComment = expressAsyncHandler(async (req, res) => {
    const postID = req.params.parentId;
    const commentID = req.params.commentId;

    if(!mongoose.isValidObjectId(postID) || !mongoose.isValidObjectId(commentID)) {
        throw new Error("Invalid Post or Comment ID Provided")
    }

    const comment = await Comment.findById(commentID);

    if(comment && comment.By.toString() != res.locals.id.toString()){
        res.status(400)
        throw new Error("User Doesn't have write permission for this Comment")
    }

    const post = await Post.findById(postID);
    
    if (post) {
        const userID = post.By;
        
        const canAccessPost = await isUsersPostAccessible(res.locals.id, userID);
        
        if (canAccessPost) {
            const comment = await Comment.findByIdAndDelete(commentID)

            let replies = await Comment.find({ Parent: commentID }).select('_id') || []
            replies = replies.map(reply => reply._id)
            const repliesDeleted = await Comment.deleteMany({ _id: { $in: [...replies] } })

            let likes = await Reaction.find({ Parent: { $in: [...replies, commentID] } }).select('_id') || []
            likes = likes.map(like => like._id)
            const likesDeleted = await Reaction.deleteMany({ _id: { $in: [...likes] } })

            const impression = (likes.length * commentLike) + ((replies.length + 1) * postComment)
        
            updatePostImpressions(postID, -(impression));
            const post = await Post.findByIdAndUpdate(postID, {$inc: {CommentsCount: -1}}).exec();
        
            res.status(200).json({ message: "Comment Deleted" })
        } else {
            res.status(400).json({ message: "Not Authorized to view Post" })
        }
    } else {
        res.status(404).json({ message: "Post Not Found" })
    }
})

module.exports = { getPostComments, createComment, updateComment, deleteComment }