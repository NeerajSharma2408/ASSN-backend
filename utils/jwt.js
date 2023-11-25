const JsonWebToken = require('jsonwebtoken');
const JWT = require('../model/JWT')

const createToken = async function (id, username) {
    try {
        let jwt = await JWT.findOne({ UserID: id })
        const Token = JsonWebToken.sign({ id, username }, process.env.JWT_SECRET, { expiresIn: '1d' })
        if (jwt) {
            jwt = await JWT.findOneAndUpdate({ UserID: id}, { $set: { Token: Token }})
            return {result: true, message: "TOKEN UPDATED"}
        }else{
            const userData = { UserID: id, Token: Token }
            jwt = await JWT.create(userData);
            console.log(jwt)
            
            return {result: true, message: "TOKEN CREATED"}
        }
    } catch (error) {
        console.log("Create Error: ", error)
        return {result: false, message: "TOKEN COULDN'T BE CREATED"}
    }
}

const verifyToken = async function (id) {
    const jwt = await JWT.findOne({ UserID: id })
    if (jwt) {
        const data = JsonWebToken.verify(jwt.Token, process.env.JWT_SECRET)
        return { result: true, data }
    } else {
        console.log("Token Not present")
        return { result: false, data: {} };
    }
}

const deleteToken = async function (id) {
    JWT.findOneAndDelete({ UserID: id })
    .then((res)=>{
        console.log("JWT DESTROYED SUCCESSFULLY", res)
    })
    .catch((err)=>{
        console.log("Delete Error: ", err)
    })
}

module.exports = { createToken, verifyToken, deleteToken }