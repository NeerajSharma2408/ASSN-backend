const authRoutes = require('express').Router();
const { mailController, usernameController, login } = require('../controller/authController');

authRoutes.post('/signup/email', mailController);
authRoutes.post('/signup/otp', mailController);
authRoutes.post('/signup/createuser', usernameController);

authRoutes.post('/login', login);

module.exports = authRoutes