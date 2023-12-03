const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GroupSchema = new Schema({
    Members: {
        type: [{
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
        }],
        required: true,
        validate: function () {
            return (this.Members.length <= 128);
        },
    },
    Muted: {
        type: Number,
        deafult: 0,
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model('Group', GroupSchema)