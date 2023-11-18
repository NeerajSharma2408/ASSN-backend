const { createToken } = require("../middleware/jwtAuth")
const { getHash, verifyHash } = require('../middleware/bcryptHash')
const mailHandler = require('../middleware/mail');
const { writeHandler, authHandler } = require('../middleware/otp')
const cryptoHash = require("../middleware/cryptoHash");

const User = require("../model/User");

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
      const hashString = cryptoHash(email.split('@')[1]);
      const pass = await getHash(password);

      const userData = {
        Username: username,
        Email: email,
        Password: pass,
        Community: hashString
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
        res.status(200).json({responseData, token});
      } else {
        res.status(500).json({ userCreated: 'false', message: "Unable to Create a new user" });
      }
    } catch (err) {
      console.log("Signup Username Error: ", err)
      res.status(500).json({ message: "Internal Server error( Unable to make a Community )" })
    }
  }
}

const login = async function (req,res){
  const userOrMail = req.body.username;
  const pass = req.body.password;

  // HERE WE ARE CHECKING IF THE GIVEN CREDENTIALS MATCH IN THE ONE IN DB
  try {
      const user = await User.findOne({$or: [{Email: userOrMail}, {Username: userOrMail}]})
      if(user){
          const auth = await verifyHash(user.Password, pass)
          if(auth){
              // const responseData = {
              //     id: user._id,
              //     name: user.Name,
              //     username: user.Username,
              //     email: user.Email,
              //     community: user.Community,
              //     bio: user.Bio,
              //     friends: user.Friends,
              //     message: "Successfully Logged In"
              // }
              const token = createToken(user._id)
              res.status(200).json({user, token})
          }
          else{
              res.status(400).json({message: "Incorrect password" })
          }
      }else{
          res.status(400).json({message: "User not Found" });
      }
  } catch (error) {
      console.log("Login Error: ",  error)
      res.status(500).json({message: "Internal server error"})
  }
}

// IMPLEMENT
// sirf id store karni hai?
// logout kaise karna hai?
// routes secure kaise karne hai?

const logout = async function (req, res){
  res.status(200).json({message: " Logged out successfully"})
}

module.exports = { mailController, usernameController, login, logout };