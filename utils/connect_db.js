const mongoose = require("mongoose");

const connectDB = async (DB_URL) => {
  try {
    mongoose.connect(DB_URL).then(() => {
      console.log("Connected to MongoDB database.");
    });
  } catch (error) {
    console.log("Error connecting to the database: ", error);
  }
};
module.exports = connectDB;
