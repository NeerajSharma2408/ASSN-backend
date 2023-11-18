const router = require('express').Router();
const { mailController, usernameController, login } = require('../controller/authController');

router.post(['signup/email', 'signup/otp'], mailController);
router.post('signup/createuser', usernameController);

router.post('login', login);

module.exports = router