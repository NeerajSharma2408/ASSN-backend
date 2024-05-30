const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    Caption: {
        type: String,
        max: 255,
    },
    By: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'User',
    },
    MediaURLs: {
        type: [String],
        validate: {
            validator: function (arr) {
                return arr.length < 6
            },
            message: "There can't exist more than 5 Media Entities in a single post."
        },
    },
    Content: {
        type: String,
        max: 1024,
    },
    Impressions: {
        type: Number,
        default: 0,
        min: 0
    },
    isPrivate: {
        type: Boolean,
        default: false,
        required: true,
    },
    Community: {
        type: String,
        required: true,
    },
    LikesCount: {
        type: Number,
        default: 0,
        validate: {
            validator: function (likes) {
                return (likes >= 0);
            },
            message: "Likes can't be less than 0",
        },
    },
    CommentsCount: {
        type: Number,
        default: 0,
        validate: {
            validator: function (comment) {
                return (comment >= 0);
            },
            message: "Comments can't be less than 0",
        },
    },
},{
    timestamps: true,
});

PostSchema.index({Community: 1, By: 1, timestamps: -1})

module.exports = mongoose.model('Post', PostSchema)