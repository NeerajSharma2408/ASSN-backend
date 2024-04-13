const express = require('express')
const cors = require('cors')
const session = require('express-session')
const SocketIo = require('socket.io')

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
// const ConnectedUsers = require('./lib/connectedUsers');
const expressAsyncHandler = require('express-async-handler');
const { disconnected, getChatHeads, getChatMessages, newUserConnected } = require('./services/sockets');

require('dotenv').config();



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', cors());

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL

const server = app.listen(PORT, expressAsyncHandler(async (err) => {
    if (err) {
        console.log("SERVER error: ", err)
    } else {
        console.log("SERVER Running at Port: ", PORT)
        connectDB(DB_URL)
    }
}));

const io = SocketIo(server);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// middleware for setting up socket io instance for creating emit events from controller functions
app.use((req, res, next) => {
    req.app = { io };
    next();
})

// * important
// ! deprecated
// ? query
// todo


app.get('/api/', (req, res) => {
    res.status(200).json({ message: "APP ROOTs" })
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

io.on('connection', async (socket) => {
    // console.log("New User connected", ConnectedUsers);
    
    // Event handler for new user connected
    socket.on('new-user-connected', ({ userID, community, toId })=>{
        newUserConnected({ socket, userID, community, toId })
    });

    // Event handler for getting chat heads  
    socket.on('get-chat-heads', ({userID})=>{
        getChatHeads(socket, userID, limit=15, page=1);
    })
    
    // Event handler for getting chat messages
    socket.on('get-chat-messages', ({groupID})=>{
        getChatMessages(socket, userID, groupID, limit=50, page=1);
    })

    socket.on('disconnect', ()=>{
        disconnected(socket)
    });
});

module.exports = io;