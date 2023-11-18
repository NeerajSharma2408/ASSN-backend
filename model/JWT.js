const mongoose = require('mongoose')
const JsonWebToken = require('jsonwebtoken');

const JwtSchema = new mongoose.Schema({
    UserID: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    Token: {
        type: String,
        unique: true,
        required: true
    }
}, {
    timestamps: true
})

JwtSchema.method.create = async function (id){
    id = (id).toString()
    console.log(id)
    let jwt = await this.findOne({UserID: id})
    if(jwt){
        console.log("Token already present: ", jwt.Token)
        return jwt
    }else{
        try {
            const Token = JsonWebToken.sign({id}, process.env.JWT_SECRET, { expiresIn: '3d' })
            jwt = await this.create({UserID: id, Token: Token})
            console.log("Token Created", jwt)
            return jwt;
        } catch (error) {
            console.log(error)
            return "false"
        }
    }
}

JwtSchema.statics.verify = async function (_id){
    let jwt = await this.findOne({UserID: _id})?.Token
    if(!jwt){
        console.log("Token Not present")
        return {result: false, data: {}};
    }else{
        console.log(jwt)
        const data =  JsonWebToken.verify(token, process.env.JWT_SECRET);
        if(data){
            return {result: true, data}
        }else{
            return {result: false, data: {}}
        }
    }
}

JwtSchema.statics.delete = async function (_id){
    const jwt = await this.findOneAndDelete({UserID: _id})
    console.log(jwt)
    return {result: true, jwt}
}

module.exports =  mongoose.model("JWT", JwtSchema)