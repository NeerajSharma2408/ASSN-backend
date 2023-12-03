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
        ref: 'User',
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
},{
    timestamps: true,
});

MessageSchema.index({timestamps: -1})

module.exports = mongoose.Model('Message', MessageSchema)