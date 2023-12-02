const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    Caption: {
        type: String,
        max: 255,
    },
    User: {
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
    Likes: {
        type: [{
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Reaction',
        }],
        deafult: [],
    },
    Comments: {
        type: [mongoose.SchemaTypes.ObjectId],
        default: [],
    },
    Community: {
        type: String,
        required: true,
    },
},{
    timestamps: true,
});

PostSchema.index({community: 1, User: 1, timestamps: -1})

module.exports = mongoose.Model('Post', PostSchema)