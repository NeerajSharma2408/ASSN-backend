const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ReactionSchema = new Schema({
    Parent: {
        type: mongoose.SchemaTypes.ObjectId,
        refPath: 'onModel',
        required: true,
    },
    onModel: {
      type: String,
      enum: ['Post', 'Message', 'Comment'],
    },
    By: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
    },
    Avatar: {
        type: String,
        deafult: "",
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
        default: 'THUMBS UP'
    },
},{
    timestamps: true,
});

ReactionSchema.index({Parent: 1})

module.exports = mongoose.model('Reaction', ReactionSchema)