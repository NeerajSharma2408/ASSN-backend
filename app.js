const express = require('express')
const cors = require('cors')

const connectDB = require('./utils/connect_db');
const authRoutes = require('./routes/authRoutes')

require('dotenv').config();



const app = express();
app.use(express.json())
app.use(express.urlencoded( { extended: true } ))
app.use('/', cors())

// * important
// ! deprecated
// ? query
// todo

// API ROUTES
app.use('/api/auth/', authRoutes);
// app.post("/api/auth/signup/email", (req,res)=>{
//      console.log(req.body)
//      res.status(200).json({message: "THIS IS A MESSGAE"})
// })



const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL

const server = app.listen(PORT, async (err) => {
    if (err) {
        console.log("SERVER error: ", err)
    } else {
        console.log("SERVER Running at Port: ", PORT)
        connectDB(DB_URL)
    }
})