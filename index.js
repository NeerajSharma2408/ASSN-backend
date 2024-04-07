const express = require('express')
const cors = require('cors')
const session = require('express-session')
const { Server } = require('socket.io')

const sessionAuth = require('./middleware/sessionAuth');
const { errorHandler } = require('./middleware/errorHandler');

const connectDB = require('./utils/connect_db');

const authRoutes = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const commentRouter = require('./routes/commentRoutes');
const reactRouter = require('./routes/reactRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const ConnectedUsers = require('./lib/connectedUsers');

require('dotenv').config();



const app = express();
app.use(express.json());
app.use(express.urlencoded( { extended: true } ));
app.use('/', cors());

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

const io = new Server(server);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// middleware for setting up socket io instance for creating emit events from controller functions
app.use((req, res, next)=>{
    req.app = {io};
    next();
})

// * important
// ! deprecated
// ? query
// todo


app.get('/api/', (req,res)=>{
    res.status(200).json({message: "APP ROOTs"})
})
// API ROUTES
app.use('/api/auth/', authRoutes); // Authentication Routes
app.use('/api/user/', sessionAuth, userRouter); // User Routes
app.use('/api/post/', sessionAuth, postRouter); // Post Routes
app.use('/api/comment/', sessionAuth, commentRouter); // Comment Routes
app.use('/api/react/', sessionAuth, reactRouter); // Reaction Routes
app.use('/api/dashboard/', sessionAuth, dashboardRouter); // Dashboard Routes
app.use('/api/notification/', sessionAuth, notificationRoutes); // Dashboard Routes
app.use('/api/chat/', sessionAuth, chatRoutes); // Dashboard Routes

// middleware for handling asynchronous and synchronus errors
app.use(errorHandler)

io.on('connection', (socket)=>{
    console.log("New User connected", ConnectedUsers);
    
    // for testing purpose only
    // test for different communities are left
    socket.on('new-user-connected', ({userId, community, toId})=>{
        ConnectedUsers[userId] = { community, socketId: socket.id }
        
        socket.join(community);
        
        socket.broadcast.to(community).emit('new-user-broadcasted', ({message: ConnectedUsers[userId], userId, "info": "BROADCASTED MESSAGE"}));

        socket.to(ConnectedUsers[toId]?.socketId).emit('new-user-singleton', ({message: ConnectedUsers[userId], userId, "info": "EMITTED MESSAGE"}));
    })

    socket.on('disconnect', () => {
        delete ConnectedUsers[socket.id];
        console.log('user disconnected');
    });
});