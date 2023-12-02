const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ReactionSchema = new Schema({
    By: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
    },
    Reaction: {
        type: String,
        enum: [
            'THUMBS UP',
            'HEART',
            'SHOCKED',
            'ANGRY',
            'CLAP',
        ],
        deafult: 'THUMBS UP'
    }
},{
    timestamps: true,
});

module.exports = mongoose.Model('Reaction', ReactionSchema)