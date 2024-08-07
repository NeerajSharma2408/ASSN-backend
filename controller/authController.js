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

  const { email, password, username, name } = req.body;

  const userId = await User.exists({
    $or: [{ Username: username }, { Email: email }]
  })

  if (userId) {
    res.status(400);
    throw new Error("Username taken");
  } else {
    const hashString = cryptoHash(email.split('@')[1]);
    const pass = await getHash(password);

    const userData = {
      Username: username,
      Email: email,
      Password: pass,
      Community: hashString,
      Name: name
    }

    const user = await User.create(userData);

    if (user.id) {
      const response = await createToken(user._id, user.Username)
      if (response.result) {
        res.cookie("universe_auth_token", {
          "userID": user._id,
          "username": user.Username,
          "loggedIn": true
        }, {
          httpOnly: true,
          sameSite:process.env.NODE_ENV === "production" ? "none":undefined,
          secure: process.env.NODE_ENV === "production",
          maxAge: 86400000,
        });

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
      if (response.result) {
        res.cookie("universe_auth_token", {
          "userID": user._id,
          "username": user.Username,
          "loggedIn": true
        }, {
          httpOnly: true,
          sameSite:process.env.NODE_ENV === "production" ? "none":undefined,
          secure: process.env.NODE_ENV === "production",
          maxAge: 86400000,
        });
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

    const user = await User.findOne({ Email: email })

    const response = await createToken(user._id, user.Username)
    if (response.result) {
      // SESSION CREATED
      res.cookie("universe_auth_token", {
        "userID": user._id,
        "username": user.Username,
        "loggedIn": true
      }, {
        httpOnly: true,
        sameSite:process.env.NODE_ENV === "production" ? "none":undefined,
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000,
      });
      
      const pass = await getHash(password)
      const updatedUser = await User.findOneAndUpdate({ Email: email }, { $set: { Password: pass } }, { new: false, select: '-Password' })

      res.status(200).json({ passwordResetSuccess: true, updatedUser })
    } else {
      throw new Error("Unable to create Session Token")
    }
  }
})

// const logout = expressAsyncHandler(async function (req, res) {
//   console.log("1",res.locals);
//  // const id = new ObjectId(req.cookies["universe_auth_token"].userID) || req.body;
//  const id=res.locals.id;
//   if (!id) {
//     res.status(400).json({ message: "ID neither present in session nor in body" })
//   } else {
//     deleteToken(id)
//     res.cookie("universe_auth_token","",{
//       sameSite:process.env.NODE_ENV === "production" ? "none":undefined,
//       secure: process.env.NODE_ENV === "production",
//       maxAge: 1,
//     });
//     res.status(200).json({ message: "SESSION DESTROYED" })
//   }
// })

const logout=(req, res)=>{
    res.cookie("universe_auth_token","",{
      sameSite:process.env.NODE_ENV === "production" ? "none":undefined,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1,
    });
    setTimeout(()=>{
      res.send();
    },1000)
    
  }



module.exports = { mailController, usernameController, login, resetpass, logout };