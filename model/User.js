const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  Name: {
    type: String,
    required: true,
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
      "Others"
    ],
    required: true,
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
    type: [Schema.Types.ObjectId],
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
}, {
  timestamps: true
});

UserSchema.index({community: 1, username: 1})

// probably have to be changed beacuse signup is not 1 single api call
UserSchema.statics.signup = async function (Name, Email, PhoneNumber, Password,){
  const exists = await this.findOne({ Email });
  if (exists) {
    throw new Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(Password, salt);
  const user = await this.create({
    Name,
    Email,
    PhoneNumber,
    Password: hashedPassword,
  });
  return user;
};

UserSchema.statics.login = async function (Email, Password) {
  const user = await this.findOne({ Email });
  if (!user) {
    throw Error("Account does not exists.");
  }
  const match = await bcrypt.compare(Password, user.Password);
  if (!match) {
    throw Error("Invalid credentials.");
  }
  return user;
};

module.exports = mongoose.model("User", UserSchema);