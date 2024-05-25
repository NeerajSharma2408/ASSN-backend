const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    Post: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Post',
    },
    By: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'User',
    },
    Avatar: {
        type: String,
        deafult: "",
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
    LikesCount: {
        type: Number,
        default: 0,
        validate: {
            validator: function () {
                return (this.likes >= 0);
            },
            message: "Likes can't be less than 0",
        },
    }
},{
    timestamps: true,
});

CommentSchema.index({Post: 1, timestamps: -1})

module.exports = mongoose.model('Comment', CommentSchema)