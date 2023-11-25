const authRoutes = require('express').Router();
const { mailController, usernameController, login, resetpass, logout } = require('../controller/authController');
// const sessionAuth = require('../middleware/sessionAuth');

// SIGN UP ROUTES
authRoutes.post('/signup/email/', mailController);
authRoutes.post('/signup/otp/', mailController);
authRoutes.post('/signup/createuser/', usernameController);

// LOGIN ROUTE
authRoutes.post('/login/', login);

// RESET PASSWORD ROUTE
authRoutes.post('/resetpass/', resetpass);

// LOGOUT ROUTE
authRoutes.get('/logout/', logout);

// authRoutes.get('/test', sessionAuth, (req, res)=>{
//     res.status(200).json({message: "AUTHENTICATED"})
// })

module.exports = authRoutes