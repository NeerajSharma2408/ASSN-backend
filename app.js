const express = require('express')
const cors = require('cors')
const session = require('express-session')

const connectDB = require('./utils/connect_db');
const authRoutes = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');

const sessionAuth = require('./middleware/sessionAuth');

require('dotenv').config();



const app = express();
app.use(express.json())
app.use(express.urlencoded( { extended: true } ))
app.use('/', cors())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// * important
// ! deprecated
// ? query
// todo

// API ROUTES
app.use('/api/auth/', authRoutes);
app.use('/api/:username/', sessionAuth, userRouter);


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