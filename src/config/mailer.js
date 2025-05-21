const nodeMailer = require('nodemailer');
require('dotenv').config();
let transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    rateDelta: 6000,
    rateLimit: 1,
    maxConnections: 1,
    maxMessages: 1,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});
//send mail
const sendMail = async (email, expirate) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail({
            from: `"Admin" <${process.env.EMAIL_USERNAME}>`,
            to: email,
            subject: 'Validate Email',
            text: `Click here to validate your email`,
            html: `Click here to validate your email: <a href="http://localhost:3000/auth/validate?email=${email}&expirate=${expirate}">Click here</a>`
        }, (error, info) => {
            if (error) {
                reject(error); // Trả về lỗi nếu có
            } else {
                resolve(info); // Trả về thông tin email nếu gửi thành công
            }
        });
    });
};
module.exports = {sendMail};