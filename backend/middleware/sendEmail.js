const nodemailer = require('nodemailer');
const asyncHandler = require('express-async-handler');


const sendEmail = asyncHandler(async (to, subject, rhtml) => {
    let testAccount = await nodemailer.createTestAccount();
    // let transporter = nodemailer.createTransport({
    //     host: "smtp.ethereal.email",
    //     port: 2525,
    //     secure: false, // true for 465, false for other ports
    //     auth: {
    //         user: testAccount.user, // generated ethereal user
    //         pass: testAccount.pass, // generated ethereal password
    //     },
    // });

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'selecktstaff@gmail.com',
            pass: '#staffingmadesimple1'
        }
    });

    const mailOptions = {
        from: 'noreply@seleckt.com',
        to: to,
        subject: subject,
        html: rhtml
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return false;
        } else {
            console.log('Email sent: ' + info.response);
            return true;
        }
    })

})



module.exports = { sendEmail }