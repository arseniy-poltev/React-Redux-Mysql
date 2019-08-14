const nodemailer = require("nodemailer");
var config = require('../config/database.js');
var authEmail = config.userName;
var authPass = config.userPassword;
module.exports = {
    /**
     * @desc {
     *     user:"for user data,for mail notification",
     *     subject:"Subject for sending mail"
     *     mailMsg:"msg send to the user",
     *     successMsg:"api response message"
     *
     * }
     * @param params
     * @param callback
     */
    emailNotification: function (params, callback) {
        let mailMsg = params.mailMsg ? params.mailMsg : "Thank You";
        let successMsg = params.successMsg ? params.successMsg : "Success";
        let subject = params.subject ? params.subject : "New Register";
        // create reusable transport method (opens pool of SMTP connections)
        let smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            host: "smtp.gmail.com", // hostname
            secureConnection: false, // use SSL
            port: 587, // port for secure SMTP
            auth: {
                user: authEmail,
                pass: authPass
            }
        });

        // setup e-mail data with unicode symbols
        let mailOptions = mailMsg.indexOf('<') > -1 ? {
            from: "Angle Hosts", // sender address
            to: params.email, // list of receivers
            subject: subject, // Subject line
            html: mailMsg,
        } : {
            from: "Angle Hosts", // sender address
            to: params.email, // list of receivers
            subject: subject, // Subject line
            text: mailMsg,
        };

        // send mail with defined transport object
        smtpTransport.sendMail(mailOptions, function (error, response) {
            console.log("Emailing Response: ", response);
            if (error) {
                console.log("In-Notification-Err: ", error);
                let result = {
                    flag: false,
                    message: "Error"
                };
                callback(null, result)
            } else {
                console.log("Notification-Success");
                let result = {
                    flag: true,
                    message: successMsg
                };
                callback(null, result)
            }
        });
    },

    mailSender: function (params, callback) {
        let user = params.user;
        // create reusable transport method (opens pool of SMTP connections)
        let smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            host: params.host, // hostname
            secureConnection: false, // use SSL
            port: 587, // port for secure SMTP
            auth: {
                user: "jacktech88@gmail.com",
                pass: "jackTech@123"
            }
        });
        // setup e-mail data with unicode symbols
        let mailOptions = {
            from: "support@kolcooli.info", // sender address
            to: user.email, // list of receivers
            subject: params.subject ? params.subject : "Support", // Subject line
            text: params.text ? params.text : "Email Notification", // plaintext body
            //text: 'Click on the link to reset your password..' + fullUrl + '/home/js2/Desktop/Projects/KolCooli/forgot-password-page/' + params._id + '/' + linkExpirationCode, // plaintext body
            //html: templateResult.html ? templateResult.html : "" // html body
        };

        console.log("Send::::Mail");
        // send mail with defined transport object
        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
                callback(null, false)
            } else {
                callback(null, true)
            }
        });
    },
};