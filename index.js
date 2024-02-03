const express = require('express')
const cors = require('cors')
const session = require('express-session')

const sessionAuth = require('./middleware/sessionAuth');
const { errorHandler } = require('./middleware/errorHandler');

const connectDB = require('./utils/connect_db');

const authRoutes = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const commentRouter = require('./routes/commentRoutes');
const reactRouter = require('./routes/reactRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');

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


app.get('/api/', (req,res)=>{
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.status(200).json({message: "APP ROOTs"})
})
// API ROUTES
app.use('/api/auth/', authRoutes); // Authentication Routes
app.use('/api/user/', sessionAuth, userRouter); // User Routes
app.use('/api/post/', sessionAuth, postRouter); // Post Routes
app.use('/api/comment/', sessionAuth, commentRouter); // Comment Routes
app.use('/api/react/', sessionAuth, reactRouter); // Reaction Routes
app.use('/api/dashboard/', sessionAuth, dashboardRouter); // Dashboard Routes

// middleware for handling asynchronous and synchronus errors
app.use(errorHandler)

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