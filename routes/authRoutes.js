const authRoutes = require('express').Router();
const { mailController, usernameController, login, resetpass, logout } = require('../controller/authController');

// SIGN UP ROUTES
authRoutes.post(['/signup/email/', '/signup/otp/'], mailController);
authRoutes.post('/signup/createuser/', usernameController);

// LOGIN ROUTE
authRoutes.post('/login/', login);

// RESET PASSWORD ROUTE
authRoutes.post('/resetpass/', resetpass);

// LOGOUT ROUTE
authRoutes.get('/logout/', logout);

module.exports = authRoutes