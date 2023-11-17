const jwt = require('jsonwebtoken');

const createToken = (_id)=>{
    console.log('id', _id)
    console.log('jwt secret', process.env.JWT_SECRET)
    return jwt.sign({_id}, process.env.JWT_SECRET, { expiresIn: '3d' })
}

module.exports = createToken