const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  Name: {
    type: String,
    default: '',
  },
  Username: {
    type: String,
    unique: true,
    required: true,
  },
  Email: {
    type: String,
    unique: true,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  DOB: {
    type: Date,
    max: new Date(new Date() - (18*12*31*24*60*60*1000))
  },
  Gender: {
    type: String,
    enum: [
      "Male",
      "Female",
      "Others",
      "Not Set"
    ],
    default: "Not Set",
  },
  Avatar: {
    type: String,
    default: "" // give a avatar pic url from cloudinary import using env url
  },
  Bio: {
    type: String,
    max: 255,
  },
  Community: {
    type: String,
    required: true,
  },
  Groups: {
    type: [{
      GroupID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Group',
      },
      hasLeftGroup: {
        type: Boolean,
        default: false
      },
      hasDeletedGroup: {
        type: Boolean,
        default: false,
      },
    }],
    default: [],
  },
  isPrivateAccount: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});

UserSchema.index({Community: 1, Username: 1})

module.exports = mongoose.model("User", UserSchema);