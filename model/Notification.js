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
            'friend_request_sent',  // Sent you a Friend Request
            'friend_request_accepted',  // Accepted your Friend Request
            'sent_message',  // Sent you a message
            'commented_on_post',  // Commented on your Post
            'replied_to_comment',  // Replied to your comment
            'reacted_to_post',  // Reacted to your post
            'reacted_to_comment',   // Reacted to your comment
            'reacted_to_message',   // Reacted to your Message
            'added_to_group',   // Added to Group
            'removed_from_group',   // Removed from Group
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
    Message: {
        type: String,
        required: true,
    },
    isRead: {
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