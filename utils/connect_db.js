const mongoose = require("mongoose");

const connectDB = async (MONGO_URI) => {
  try {
    mongoose.connect(MONGO_URI).then(() => {
      console.log("Connected to MongoDB database.");
    });
  } catch (error) {
    console.log("Error connecting to the database: ", error);
  }
};
module.exports = connectDB;
