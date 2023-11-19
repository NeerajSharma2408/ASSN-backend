const authRoutes = require('express').Router();
const { mailController, usernameController, login, logout } = require('../controller/authController');
const sessionAuth = require('../middleware/sessionAuth');

authRoutes.post('/signup/email', mailController);
authRoutes.post('/signup/otp', mailController);
authRoutes.post('/signup/createuser', usernameController);

authRoutes.post('/login', login);

authRoutes.get('/logout', logout);

// authRoutes.get('/test', sessionAuth, (req, res)=>{
//     res.status(200).json({message: "AUTHENTICATED"})
// })

module.exports = authRoutes