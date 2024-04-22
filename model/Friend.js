const mongoose = require('mongoose')

const Schema = mongoose.Schema

const FriendSchema = new Schema({
    Requester: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    Recipient: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    Status: {
        type: Number,
        enum: [
            0,    // 'add friend',
            1,    // 'requested',
            2,    // 'rejected',
            3,    // 'friends',
            4,    // 'blocked',
            5,    // 'restricted',
            6,    // 'pending',
        ],
        default: 0
    },
}, {
    timestamps: true,
})

FriendSchema.index({Status: 1})

module.exports = mongoose.model('Friend', FriendSchema)