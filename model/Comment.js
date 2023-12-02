const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    Post: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Post',
    },
    Creator: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'User',
    },
    Parent: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Comment',
        default: null
    },
    Message: {
        type: String,
        max: 512,
        required: true,
    },
    Likes: {
        type: [mongoose.SchemaTypes.ObjectId],
        default: [],
    }
},{
    timestamps: true,
});

CommentSchema.index({Post: 1, timestamps: 1})

module.exports = mongoose.Model('Comment', CommentSchema)