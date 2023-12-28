const { verifyToken } = require('../utils/jwt');
const { ObjectId } = require('mongoose').Types

const sessionAuth = async (req, res, next)=>{
    const username = req.session.username
    const id = new ObjectId(req.session.userID)
    req.username = username
    res.locals = req.params
    res.locals['id'] = id
    if(!id || !username){
        res.status(400).json({message: "Session not present"})
    }else{
        verifyToken(id)
        .then((response)=>{
            if(response.result){
                next()
            }else{
                res.status(400).json({message: "SESSION AUTHENTICATION FAILED"})
            }
        })
        .catch((err)=>{
            res.status(500).json({message: err.message})
        })
    }
}

module.exports = sessionAuth