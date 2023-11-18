const authRoutes = require('express').Router();
const { mailController, usernameController, login, logout } = require('../controller/authController');
const JWT = require('../model/JWT');

authRoutes.post('/signup/email', mailController);
authRoutes.post('/signup/otp', mailController);
authRoutes.post('/signup/createuser', usernameController);

authRoutes.post('/login', login);

authRoutes.get('/logout', logout);

authRoutes.get('/test', (req, res)=>{
    JWT.verify(req.id)
    res.status(200)
})

module.exports = authRoutes