const Otp = require('../model/Otp');

const readHandler = async () => {    
    const otp = await Otp.find();
    return otp;
}

const writeHandler = async (email, otp, mid) => {

    const newotp = {
        email: email,
        otp: otp, // ENCRYPTION COULD BE USED HERE
        msgid: mid
    }
    await Otp.create(newotp);
}

const authHandler = async (email, otp) => {

    let confirmed = false
    let msg = 'Otp not found'
    try {
        const iotp = await Otp.findOneAndDelete({$and: [{email, otp}]})
        if(iotp && ((Date.now() - iotp.timeStamp)/1000) > 300){
            msg = '5 Mins are Over';
        }else if(iotp){
            msg = 'Otp found'
            confirmed = true
        }
    } catch (error) {
        console.log("otp error: ", error)
        msg = "Internal server Error"
    }
    return {confirmed : confirmed, msg: msg};
}

module.exports = { readHandler, writeHandler, authHandler };