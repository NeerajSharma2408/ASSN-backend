const mongoose = require("mongoose");

const connectDB = async (DB_URL) => {
  try {
    const connect = await mongoose.connect(DB_URL)
    console.log("Connection Established with the DataBase : ", connect.connection.host, connect.connection.name)
  } catch (error) {
      console.log("DB error: ", error)
      process.exit(1)
  }
};

module.exports = connectDB;
