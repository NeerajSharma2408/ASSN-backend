const express = require('express')
const cors = require('cors')
const session = require('express-session')
const SocketIo = require('socket.io')
const cookieParser = require("cookie-parser");

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
const expressAsyncHandler = require('express-async-handler');
const { disconnected, getChatHeads, getChatMessages, newUserConnected, sendMessage, updateMessage, deleteMessage, deleteGroup, createGroup, leaveGroup } = require('./services/sockets');
const friendRouter = require('./routes/friendRoutes');

require('dotenv').config();



const app = express();
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', cors(
{origin: process.env.CLIENT_URL,
credentials: true}
));

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
app.use('/api/auth', authRoutes); // Authentication Routes
app.use('/api/user', sessionAuth, userRouter); // User Routes
app.use('/api/friend', sessionAuth, friendRouter); // Friend Routes
app.use('/api/post', sessionAuth, postRouter); // Post Routes
app.use('/api/comment', sessionAuth, commentRouter); // Comment Routes
app.use('/api/react', sessionAuth, reactRouter); // Reaction Routes
app.use('/api/dashboard', sessionAuth, dashboardRouter); // Dashboard Routes
app.use('/api/notification', sessionAuth, notificationRoutes); // Notification Routes
app.use('/api/chat', sessionAuth, chatRoutes); // Chat Routes

// middleware for handling asynchronous and synchronus errors
app.use(errorHandler)

io.on('connection', async (socket) => {
    // console.log("New User connected", ConnectedUsers);
    
    // Event handler for new user connected
    socket.on('new-user-connected', ({ userID, community, toId })=>{
        newUserConnected(socket, userID, community, toId)
    });

    // Event handler for getting chat heads  
    socket.on('get-chat-heads', ({userID})=>{
        getChatHeads(socket, userID, limit=15, page=1);
    })
    
    // Event handler for getting chat messages
    socket.on('get-chat-messages', ({groupID})=>{
        getChatMessages(socket, userID, groupID, limit=50, page=1);
    })

    // Event handler for creating group
    socket.on('create-group', ({userID, memberIDs, message, Name})=>{
        createGroup(socket, userID, memberIDs, message, Name);
    })

    // Event handler for leaving group
    socket.on('leave-group', ({userID, groupID, removedBy})=>{
        leaveGroup(socket, userID, groupID, removedBy);
    })

    // Event handler for deleting group
    socket.on('delete-group', ({userID, groupID})=>{
        deleteGroup(socket, userID, groupID);
    })

    // Event handler for sending chat messages
    socket.on('send-message', ({message, userID, groupID, replyTo})=>{
        sendMessage(socket, message, userID, groupID, replyTo);
    })

    // Event handler for updating chat messages
    socket.on('update-message', ({message, messageID, userID, groupID})=>{
        updateMessage(socket, message, messageID, userID, groupID);
    })

    // Event handler for deleting chat messages
    socket.on('delete-message', ({messageID, userID, groupID})=>{
        deleteMessage(socket, messageID, userID, groupID);
    })

    // Event handler for default disconnection
    socket.on('disconnect', ()=>{
        disconnected(socket)
    });
});

module.exports = io;