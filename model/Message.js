const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    Sender: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    Receiver: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Group',
        required: true,
    },
    Message: {
        type: String,
        required: function () {
            return !this.Attachment;
        }
    },
    Attachment: {
        type: String,
        required: function () {
            return !this.Message;
        }
    },
    Parent: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Message',
        default: null,
    },
    Reaction: {
        type: [{
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Reaction',
        }],
        deafult: [],
    },
    InGroup: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Group',
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isUpdated: {
        type: Boolean,
        default: false
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
},{
    timestamps: true,
});

MessageSchema.index({InGroup: 1, createdAt: -1})

module.exports = mongoose.model('Message', MessageSchema)