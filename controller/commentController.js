const { getPostComment, getPostCommentReplies, postComment, commentLike } = require("../lib/impressionConstants");
const Comment = require("../model/Comment");
const Reaction = require("../model/Reaction");
const { isPostAccessible } = require("../utils/postAuth");
const toggleLike = require("../utils/toggleLike");

const getPostComments = async () => {
    const postID = req.params.postid;

    updatePostImpressions(postID, getPostComment);

    const limit = req.query.limit || 15;
    const page = req.query.page || 1;

    const comments = await Comment.find({ Post: postID, Parent: null }).select('-Post').skip((page - 1) * limit).limit(limit).exec()
    if (isPostAccessible(req.id, postID) && Array.isArray(comments) && comments.length === 0) {
        res.status(400).json({ message: "No Comments Found or not Authorized to view Post" })
    } else {
        res.status(200).json({ message: "Comments Found", comments })
    }
}

const getCommentReplies = async () => {
    const postID = req.params.postid;
    const commentID = req.params.comment;

    updatePostImpressions(postID, getPostCommentReplies);

    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    const replies = await Comment.find({ Post: postID, Parent: commentID }).select('-Post').skip((page - 1) * limit).limit(limit).exec()
    if (isPostAccessible(req.id, postID) && Array.isArray(replies) && replies.length === 0) {
        res.status(200).json({ message: "No Comments Found or not Authorized to view Post" })
    } else {
        res.status(200).json({ message: "Replies Found", replies })
    }
}

const createComment = async () => {
    const { postID, parent, message } = req.body

    updatePostImpressions(postID, postComment);

    const comment = {
        Post: postID,
        By: req.id,
        Parent: parent ? parent : null,
        Message: message
    }

    const response = await Comment.create(comment)

    if (response.id) {
        res.status(200).json({ message: "Comment Created" })
    } else {
        res.status(500).json({ message: "Comment not Created. Internal server Error." })
    }
}

const toggleCommentLike = async () => {
    const commentID = req.params.commentid;
    const postID = req.params.postid;
    const { like } = req.body
    
    updatePostImpressions(postID, like ? commentLike: -commentLike);

    let response = await toggleLike(like, commentID, req.id, 1, "Comment");

    if (response.id) {
        res.status(200).json({ message: "Comment Like Toggled" })
    } else {
        res.status(500).json({ message: "Comment Like not Toggled. Internal server Error." })
    }
}

const deleteComment = async () => {
    const commentID = req.params.comment;

    try {
        const comment = await Comment.findByIdAndDelete(commentID)
        const replies = await Comment.deleteMany({ Parent: commentID }).select('_id')
        const likes = await Reaction.deleteMany({ Parent: { $in: [...replies, comment] } })

        updatePostImpressions(postID, -(likes*commentLike + (replies+1)*postComment));

        res.status(200).json({ message: "Comment Deleted" })
    } catch {
        (err) => {
            res.status(500).json({ message: "Comment not Deleted. Internal server Error." })
        }
    }
}

module.exports = { getPostComments, getCommentReplies, createComment, toggleCommentLike, deleteComment }