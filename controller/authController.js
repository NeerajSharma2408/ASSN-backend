const { getHash, verifyHash } = require('../utils/bcryptHash')
const mailHandler = require('../utils/mail');
const { writeHandler, authHandler } = require('../utils/otp')
const cryptoHash = require("../utils/cryptoHash");
const { createToken, deleteToken } = require('../utils/jwt');

const User = require("../model/User");

// const mailGenerator = async function(email){
//   const otp = (Math.round(Math.random() * (1000000 - 100000 - 1)) + 100000);

//     try {
//       const info = await mailHandler(email, otp);
//       await writeHandler(email, otp, info.messageId);

//       if (info.messageId) {
//         return res.status(200).json({ mailSent: 'true', message: "Mail Sent Successfully" })
//       } else {
//         return res.status(400).json({ mailSent: 'false', message: "There Occured an Error... Try Again" })
//       }
//     } catch (error) {
//       console.log("Mail Sending error: ", error)
//       return res.status(500).json({ mailSent: 'false', message: "Internal Server Error" })
//     }
// }

// const otpChecker = async function(otp){
//   try {
//     const authData = await authHandler(email, otp);

//     if (authData.confirmed) {
//       return res.status(200).json({ otpConfirmed: 'true', message: authData.msg });
//     } else {
//       return res.status(400).json({ otpConfirmed: 'false', message: "otp is invalid" })
//     }
//   } catch (error) {
//     console.log("OTP Sending error: ", error)
//     return res.status(500).json({ otpConfirmed: 'false', message: "Internal Server Error" })
//   }
// }

// const resetPassword = async function(email, password){
//   try {
//     const pass = getHash(password)
//       const user = await User.findOneAndUpdate({Email: email}, {$set: {Password: pass}})
//       user.Password = "PASSWORD WONT BE DISCLOSED"
//       return res.status(200).json({passwordResetSuccess: true, user})

//   } catch (error) {
//     console.log("Password Reset Error: ", error)
//     return res.status(500).json({passwordResetSuccess: false, message: "Internal Server Error"})
//   }
// }

const mailController = async (req, res) => {

  const { otp, email } = req.body

  if (!otp){
    const otp = (Math.round(Math.random() * (1000000 - 100000 - 1)) + 100000);

    try {
      const info = await mailHandler(email, otp);
      await writeHandler(email, otp, info.messageId);

      if (info.messageId) {
        return res.status(200).json({ mailSent: true, message: "Mail Sent Successfully" })
      } else {
        return res.status(400).json({ mailSent: false, message: "There Occured an Error... Try Again" })
      }
    } catch (error) {
      console.log("Mail Sending error: ", error)
      return res.status(500).json({ mailSent: false, message: "Internal Server Error" })
    }
  } else {

    try {
      const authData = await authHandler(email, otp);
  
      if (authData.confirmed) {
        return res.status(200).json({ otpConfirmed: true, message: authData.msg });
      } else {
        return res.status(400).json({ otpConfirmed: false, message: "otp is invalid" })
      }
    } catch (error) {
      console.log("OTP Sending error: ", error)
      return res.status(500).json({ otpConfirmed: false, message: "Internal Server Error" })
    }  
    
  }   

}

const usernameController = async function (req, res) {

  const { email, password, username } = req.body;

  const userId = await User.exists({
    $or: [{ Username: username }, { Email: email }]
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
        res.status(500).json({ userCreated: false, message: "Unable to Create a new user" });
      }
    } catch (err) {
      console.log("Signup Username Error: ", err)
      res.status(500).json({ message: "Internal Server error( Unable to make a Community )" })
    }
  }
}

const login = async function (req, res) {
  const userOrMail = req.body.username;
  const pass = req.body.password;

  // HERE WE ARE CHECKING IF THE GIVEN CREDENTIALS MATCH IN THE ONE IN DB
  try {
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
          res.status(500).json({ message: "Unable to create Token" })
        }
      }
      else {
        res.status(400).json({ message: "Incorrect password" })
      }
    } else {
      res.status(400).json({ message: "User not Found" });
    }
  } catch (error) {
    console.log("Login Error: ", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const resetpass = async function (req, res) {
  const { otp, email, password } = req.body

  const userExists = await User.exists({Email: email})

  if(!userExists){
    res.status(400).json({message: "EMAIL NOT FOUND. TRY SIGNNING UP"})
  } else if (!otp && !password) {

    const otp = (Math.round(Math.random() * (1000000 - 100000 - 1)) + 100000);

    try {
      const info = await mailHandler(email, otp);
      await writeHandler(email, otp, info.messageId);

      if (info.messageId) {
        return res.status(200).json({ mailSent: 'true', message: "Mail Sent Successfully" })
      } else {
        return res.status(400).json({ mailSent: 'false', message: "There Occured an Error... Try Again" })
      }
    } catch (error) {
      console.log("Mail Sending error: ", error)
      return res.status(500).json({ mailSent: 'false', message: "Internal Server Error" })
    }

  } else if (otp && !password) {

    try {
      const authData = await authHandler(email, otp);
  
      if (authData.confirmed) {
        return res.status(200).json({ otpConfirmed: 'true', message: authData.msg });
      } else {
        return res.status(400).json({ otpConfirmed: 'false', message: "otp is invalid" })
      }
    } catch (error) {
      console.log("OTP Sending error: ", error)
      return res.status(500).json({ otpConfirmed: 'false', message: "Internal Server Error" })
    }

  } else {

    try {
      const pass = await getHash(password)
        const user = await User.findOneAndUpdate({Email: email}, {$set: {Password: pass}}, {new: true, select: '-Password'})

        const response = await createToken(user._id, user.Username)
        console.log("token response: ", response.message)
        if (response.result) {
          // SESSION CREATED
          req.session.userID = user._id
          req.session.username = user.Username
          req.session.loggedIn = true
          
          res.status(200).json({passwordResetSuccess: true, user})
        } else {
          res.status(500).json({passwordResetSuccess: true, message: "Unable to create Token" })
        }
  
    } catch (error) {
      console.log("Password Reset Error: ", error)
      return res.status(500).json({passwordResetSuccess: false, message: "Internal Server Error"})
    }

  }
}

const logout = async function (req, res) {

  const id = req.session.userID ? req.session.userID : req.id
  if (!id) {
    res.status(400).json({ message: "ID neither present in session nor in body" })
  } else {
    deleteToken(id)
    req.session.destroy(function (err) {
      if (err) {
        console.log("session error: ", err)
        res.status(500).json({ message: "INTERNAL SERVER ERROR" })
      } else {
        res.status(200).json({ message: "SESSION DESTROYED" })
      }
    })
  }
}

module.exports = { mailController, usernameController, login, resetpass, logout };