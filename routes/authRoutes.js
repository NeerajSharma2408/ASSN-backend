const router = require('express').Router();
const { signup, login, email, otp } = require('../controller/authController');

router.post('signup/email', email);
router.post('signup/otp', otp);
router.post('signup/createuser', signup);

router.post('login', login);

module.exports = router