const nodemailer = require('nodemailer');

const mailHandler = async (email, otp)=>{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        auth: {
            user: "mydevtestid@gmail.com",
            pass: process.env.NODEMAILER_GMAILPASS,
        },
    });

    const info = await transporter.sendMail({
        from: 'mydevtestid@gmail.com',
        to: `${email}`,
        subject: "Hello New User✔",
        html: `<h2>We are exited to have you on this side Mate...</h2><p>This is your 'SECRET CODE' &#128521; for authentication of your 'Uni-Verse' account</p><p>Don't Share it with anyone until you wanna lose your only chance to get on best Community building site.</p><br><h1>YOUR SECRET CODE : ${otp}</h1><br><p>Enter this on your Login page to get connected with your community.</p><p>See you there soon with all your friends.</p>`,
    })

    // console.log("Message sent: %s", info.messageId);
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    return info;
}

module.exports = mailHandler