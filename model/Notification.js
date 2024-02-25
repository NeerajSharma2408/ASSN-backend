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
            RefSchema: 'User' | 'Post' | 'Message' | 'Friend' | 'Comment' | 'Group' | 'Reaction',
            RefId: mongoose.SchemaType.ObjectId, 
        }],
        required: true,
        default: {
            RefSchema: 'User',
            RefId: this.From ,
        },
    }
}, {
    timestamps: true
})

NotificationSchema.index({"updatedAt": 1});

module.exports = mongoose.model('Notification', NotificationSchema);