const argon2 = require('argon2');

const createToken = require("../middleware/jwtAuth")

const User = require("../model/User");

const mailHandler = require('../middleware/mail');
const { writeHandler, authHandler } = require('../middleware/otp')

const mailController = async (req, res) => {

  const { otp, email } = req.body

  if (!otp) {

    const otp = (Math.round(Math.random() * (1000000 - 100000 - 1)) + 100000);

    try {
      const info = await mailHandler(email, otp);
      await writeHandler(email, otp, info.messageId);

      if (info.messageId) {
        res.status(200).json({ mailSent: 'true', message: "Mail Sent Successfully" })
      } else {
        res.status(400).json({ mailSent: 'false', message: "There Occured an Error... Try Again" })
      }
    } catch (error) {
      console.log("Mail Sending error: ", error)
      res.status(500).json({ mailSent: 'false', message: "Internal Server Error" })
    }
  } else {

    try {
      const authData = await authHandler(email, otp);

      if (authData.confirmed) {
        res.status(200).json({ otpConfirmed: 'true', message: authData.msg });
      } else {
        res.status(400).json({ otpConfirmed: 'false', message: "otp is invalid" })
      }
    } catch (error) {
      console.log("OTP Sending error: ", error)
      res.status(500).json({ otpConfirmed: 'false', message: "Internal Server Error" })
    }
  }
}

const usernameController = async function (req, res) {

  const { email, password, username } = req.body;

  const userId = await User.exists({
    $or: [{ username }, { email }]
  })

  if (userId) {
    res.status(400).json({ message: "Username taken" })
  } else {
    try {
      const hash = email.split('@')[1];
      const pass = await argon2.hash(password);

      const userData = {
        username,
        email,
        password: pass.toString(),
        community: hash.toString()
      }

      const user = await User.create(userData);

      if (user.id) {
        const responseData = {
          id: user.id,
          username: user.username,
          userCreated: 'true',
          message: "User Created succesfully"
        }
        const token = createToken(user._id);
        res.status(200).json(responseData, token);
      } else {
        res.status(500).json({ userCreated: 'false', message: "Unable to Create a new user" });
      }
    } catch (err) {
      console.log("argon2 error: ", err)
      res.status(500).json({ message: "Internal Server error( Unable to make a Community )" })
    }
  }
}

const login = async function (req,res){
  const userOrMail = req.body.username;
  const pass = req.body.password;

  // HERE WE ARE CHECKING IF THE GIVEN CREDENTIALS MATCH IN THE ONE IN DB
  try {
      const user = await User.findOne({$or: [{email: userOrMail}, {username: userOrMail}]})
      if(user){
          const auth = await argon2.verify(user.password, pass)
          if(auth){
              const responseData = {
                  id: user._id,
                  name: user.name,
                  username: user.username,
                  email: user.email,
                  community: user.community,
                  bio: user.bio,
                  friends: user.friends,
                  message: "Successfully Logged In"
              }
              res.status(200).json(responseData)
          }
          else{
              res.status(400).json({message: "Incorrect password" })
          }
      }else{
          res.status(400).json({message: "Incorrect user name" });
      }
  } catch (error) {
      console.log("Login Error: ",  error)
      res.status(500).json({message: "Internal server error"})
  }
}

module.exports = { mailController, usernameController, login };