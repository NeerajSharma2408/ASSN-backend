const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GroupSchema = new Schema({
    Members: {
        type: [{
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
        }],
        required: true,
    },
    Messages: {
        type: [{
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Message',
        }],
        deafult: []
    },
    Muted: {
        type: Number,
        deafult: 0,
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model('Group', GroupSchema)