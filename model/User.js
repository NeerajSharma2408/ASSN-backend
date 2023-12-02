const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  Name: {
    type: String,
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
  Friends: {
    type: [{
      'id': Schema.Types.ObjectId,
      'username': String
    }],
    default: [],
  },
  Likes: {
    type: [Schema.Types.ObjectId],
    default: [],
  },
  Posts: {
    type: [Schema.Types.ObjectId],
    default: [],
  },
  Comments: {
    type: [Schema.Types.ObjectId],
    default: [],
  },
  Groups: {
    type: [Schema.Types.ObjectId],
    default: [],
  },
  isPrivateAccount: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});

UserSchema.index({community: 1, username: 1})

module.exports = mongoose.model("User", UserSchema);