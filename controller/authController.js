const createToken = require("../middleware/jwtAuth")
const User = require("../model/User");

const email = async (req, res) => {
  res.status(200).json({message: "EMAIL ROUTE"})
}

const otp = async (req, res) => {
  res.status(200).json({message: "OTP ROUTE"})
}

// TO BE CHANGED
const signup = async (req, res) => {
  const { Name, Email, PhoneNumber, Password } = req.body;
  try {
    const user = await User.signup(Name, Email, PhoneNumber, Password);
    //const {Name, Email, PhoneNumber}=user;
    console.log('inside signup',user)
    const token = createToken(user._id);
    res.status(200).json({ Name, Email, PhoneNumber, token });
  } catch (error) {
    console.log('inside signup catch',error.message)
    res.status(401).json({message:'Some error occurred.'});
  }
};

// TO BE CHANGED
const login = async (req, res) => {
  console.log('login')
  const { Email, Password } = req.body;
  console.log(req.body)
  try {
    const user = await User.login(Email, Password);
    const {Name,PhoneNumber}=user;
    const token = createToken(user._id);
    res.status(200).json({ Name, Email, PhoneNumber, token });
  } catch (error) {
    res.status(401).json({message:'Invalid Credentials'});
  }
};

module.exports = { login, signup, email, otp };