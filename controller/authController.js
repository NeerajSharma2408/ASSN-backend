const { getHash, verifyHash } = require('../utils/bcryptHash')
const mailHandler = require('../utils/mail');
const { writeHandler, authHandler } = require('../utils/otp')
const cryptoHash = require("../utils/cryptoHash");
const { createToken, deleteToken } = require('../utils/jwt');

const User = require("../model/User");

const expressAsyncHandler = require('express-async-handler');

const mailController = expressAsyncHandler(async (req, res) => {

  const { otp, email } = req.body

  if (!otp) {
    const otp = (Math.round(Math.random() * (1000000 - 100000 - 1)) + 100000);

    const info = await mailHandler(email, otp);
    await writeHandler(email, otp, info.messageId);

    if (info.messageId) {
      return res.status(200).json({ mailSent: true, message: "Mail Sent Successfully" })
    } else {
      return res.status(400).json({ mailSent: false, message: "There Occured an Error... Try Again" })
    }
  } else {

    const authData = await authHandler(email, otp);

    if (authData.confirmed) {
      return res.status(200).json({ otpConfirmed: true, message: authData.msg });
    } else {
      return res.status(400).json({ otpConfirmed: false, message: "otp is invalid" })
    }
  }
})

const usernameController = expressAsyncHandler(async function (req, res) {

  const { email, password, username } = req.body;

  const userId = await User.exists({
    $or: [{ Username: username }, { Email: email }]
  })

  if (userId) {
    res.status(400).json({ message: "Username taken" })
  } else {
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

      const response = await createToken(user._id, user.Username)
      console.log("token response: ", response.message)
      if (response.result) {
        req.session.userID = user._id
        req.session.username = user.Username
        req.session.loggedIn = true

        user['Password'] = "PASSWORD WONT BE DISCLOSED"
        res.status(200).json(user)
      } else {
        const userDeleted = await User.findByIdAndDelete(user.id);
        res.status(500).json({ message: "Unable to create Token. User Not Created", userDeleted })
      }

    } else {
      throw new Error("Unable to Create a new user")
    }
  }
})

const login = expressAsyncHandler(async function (req, res) {
  const userOrMail = req.body.username;
  const pass = req.body.password;

  // HERE WE ARE CHECKING IF THE GIVEN CREDENTIALS MATCH IN THE ONE IN DB
  let user = await User.findOne({ $or: [{ Email: userOrMail }, { Username: userOrMail }] }).select(' -Email')
  if (user) {
    const auth = await verifyHash(user.Password, pass)
    if (auth) {

      const response = await createToken(user._id, user.Username)
      console.log("token response: ", response.message)
      if (response.result) {
        // SESSION CREATED
        req.session.userID = user._id
        req.session.username = user.Username
        req.session.loggedIn = true

        user.Password = "Can't Reveal Password"

        res.status(200).json(user)
      } else {
        throw new Error("Unable to create Token")
      }
    }
    else {
      res.status(400).json({ message: "Incorrect password" })
    }
  } else {
    res.status(400).json({ message: "User not Found" });
  }
})

const resetpass = expressAsyncHandler(async function (req, res) {
  const { otp, email, password } = req.body

  const userExists = await User.exists({ Email: email })

  if (!userExists) {
    res.status(400).json({ message: "EMAIL NOT FOUND. TRY SIGNNING UP" })
  } else if (!otp && !password) {

    const otp = (Math.round(Math.random() * (1000000 - 100000 - 1)) + 100000);

    const info = await mailHandler(email, otp);
    await writeHandler(email, otp, info.messageId);

    if (info.messageId) {
      return res.status(200).json({ mailSent: true, message: "Mail Sent Successfully" })
    } else {
      return res.status(400).json({ mailSent: false, message: "There Occured an Error... Try Again" })
    }

  } else if (otp && !password) {

    const authData = await authHandler(email, otp);

    if (authData.confirmed) {
      return res.status(200).json({ otpConfirmed: true, message: authData.msg });
    } else {
      return res.status(400).json({ otpConfirmed: false, message: "otp is invalid" })
    }

  } else {

    const response = await createToken(user._id, user.Username)
    console.log("token response: ", response.message)
    if (response.result) {
      // SESSION CREATED
      req.session.userID = user._id
      req.session.username = user.Username
      req.session.loggedIn = true
      
      const pass = await getHash(password)
      const user = await User.findOneAndUpdate({ Email: email }, { $set: { Password: pass } }, { new: true, select: '-Password' })

      res.status(200).json({ passwordResetSuccess: true, user })
    } else {
      throw new Error("Unable to create Session Token")
    }
  }
})

const logout = expressAsyncHandler(async function (req, res) {

  const id = req.session.userID ? req.session.userID : req.body.id
  if (!id) {
    res.status(400).json({ message: "ID neither present in session nor in body" })
  } else {
    deleteToken(id)
    req.session.destroy()
    res.status(200).json({ message: "SESSION DESTROYED" })
  }
})

module.exports = { mailController, usernameController, login, resetpass, logout };