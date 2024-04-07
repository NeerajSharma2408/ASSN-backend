const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    From: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    To: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    Type: {
        type: Number,
        enum: [
            0,  // Sent you a Friend Request
            1,  // Accepted your Friend Request
            2,  // Sent you a message
            3,  // Commented on your Post
            4,  // Replied to your comment
            5,  // Reacted to your post
            6   // Reacted your comment
        ],
    },
    RefObject: {
        type: [{
            RefSchema: {
                type: String,
                validate: function (v) {
                    return ['USER', 'POST', 'MESSAGE', 'FRIEND', 'COMMENT', 'GROUP', 'REACTION'].includes(v);
                }
            },
            RefId: {
                type: mongoose.SchemaTypes.ObjectId,
            },
        }],
        required: true,
        default: {
            RefSchema: 'User',
            RefId: this.From ,
        },
    },
    Read: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
})

NotificationSchema.index({"updatedAt": 1});

module.exports = mongoose.model('Notification', NotificationSchema);