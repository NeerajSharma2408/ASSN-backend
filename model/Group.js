const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GroupSchema = new Schema({
    Members: {
        type: [{
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
        }],
        required: true,
        validate: {
            validator: function () {
                return (this.Members.length <= 128);
            },
            message: "There can't be more than 128 members in any Room",
        },
    },
    Name: {
        type: String,
        required: function () {
            return this.Members.length > 2;
        },
    },
    CreatedBy: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
    isGroupChat: {
        type: Boolean,
        default: false,
        required: true,
    },
    LastUpdation: {
        type: {
            By: {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "User"
            },
            Message: {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Message"
            }
        },
        default: {
            By: this.CreatedBy,
            Message: null
        },
        required: true,
    }
}, {
    timestamps: true,
})

GroupSchema.index({"updatedAt": 1}); // Parallely update the Group UpdatedAt field when a msg is sent or arrived

module.exports = mongoose.model('Group', GroupSchema);