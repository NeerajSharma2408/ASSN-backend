const mongoose = require('mongoose')
// const JsonWebToken = require('jsonwebtoken');
// const asyncHandler = require('express-async-handler')

const JwtSchema = new mongoose.Schema({
    UserID: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true,
        required: true,
        index: true,
        ref: 'User',
    },
    Token: {
        type: String,
        unique: true,
        required: true
    }
})

// JwtSchema.statics.create = asyncHandler(async function (id) {
//     let jwt = await this.findOne({ UserID: id })
//     if (jwt) {
//         const response = await this.verify(jwt.UserID);

//         if (response.result) {
//             return "TOKEN ALREADY PRESENT"
//         } else {
//             this.delete(jwt.UserID).then((response) => {
//                 console.log(response)
//             }).catch((err) => {
//                 console.log("Create delete Error:", err)
//             })
//         }
//     }
//     const Token = JsonWebToken.sign({ id }, process.env.JWT_SECRET, { expiresIn: '10s' })

//     const userData = { UserID: id, Token: Token }
//     jwt = new this(userData); // 'this' refers to the model
//     await jwt.save();

//     return "TOKEN CREATED"
// })

// JwtSchema.statics.verify = asyncHandler(async function (id) {
//     const jwt = await this.findOne({ UserID: id })
//     if (jwt) {
//         const data = JsonWebToken.verify(jwt.Token, process.env.JWT_SECRET);
//         if (data) {
//             return { result: true, id: data.id }
//         } else {
//             return { result: false, data: {} }
//         }
//     } else {
//         console.log("Token Not present")
//         return { result: false, data: {} };
//     }
// })

// JwtSchema.statics.delete = asyncHandler(async function (_id) {
//     this.findOneAndDelete({ UserID: _id })
//     return "JWT DESTROYED SUCCESSFULLY"
//     // .then((jwt) => {
//     // }).catch((err) => {
//     //     return err
//     // })
// })

module.exports = mongoose.model("JWT", JwtSchema)