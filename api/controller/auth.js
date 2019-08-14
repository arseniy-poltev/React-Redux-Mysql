const heredoc = require('heredoc');
const sequelize = require('sequelize');
const multer = require('multer');
const mime = require('mime');
let config = require('../config/database.js');
const ValidateService = require('../service/ValidatorService.js');
const CommonService = require('../service/CommonService.js');
const NotificationService = require('../service/NotificationService.js');
const async = require('async');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const constants = require("../constants");
const connection = config.connection;
const authEmail = config.userName;
const authPass = config.userPassword;
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './files/');
    },
    filename: function (req, file, callback) {
        console.log(file.fieldname);
        console.log("filename", file);
        callback(null, file.fieldname + '-' + Date.now() + '.' + mime.extension(file.mimetype));
    }
});
let upload = multer({storage: storage}).array('mediaVideo', 1);

const verifyCode = {};// key: token, value: userId
const forgotPasswordCode = {};// key: token, value: userId
module.exports = {
    /**
     * @desc : login user
     * @param req = {
     *     "email":"",
     *     "password":""
     * }
     * @param res => return user with token
     */
    login: function (req, res) {
        let params = req.body;
        console.log("In---Login", params);
        try {
            //check required field
            let isValid = ValidateService.checkCommonValidation(params);
            let reqValid = ValidateService.checkLoginReqValidation(params);
            if (!isValid) {
                return res.json({
                    "code": 400,
                    "status": "Error",
                    "message": "Please enter proper data"
                });
            } else if (!reqValid) {

                return res.json({
                    "code": 400,
                    "status": "Error",
                    "message": "Please enter required data"
                });
            } else {
                async.waterfall([
                    //check user exist or not
                    function (wcb) {
                        console.log("In--Check");
                        var select_sql = heredoc(function () {/*
                        SELECT * FROM users WHERE email=:email OR userName=:userName
                        */
                        });
                        connection.query(select_sql, {
                            type: sequelize.QueryTypes.SELECT,
                            replacements: {
                                email: params.email,
                                userName: params.email
                            }
                        }).then((users) => {
                            if (users && users.length > 0) {
                                wcb(null, _.first(users))
                            } else {
                                return res.json({
                                    "code": 400,
                                    "message": "User Not Found",
                                    "data": {},
                                });
                            }
                        }).catch((err) => {
                            console.log(">>>>>>>>>>>>>>>>>error>>", err);
                            return res.json({
                                "code": 400,
                                "message": "Error",
                                "data": err,
                            });
                        });
                    },
                    //compare and approve
                    function (user, wcb) {
                        console.log("In--User", user);
                        let option = {
                            user: user,
                            password: params.password
                        };
                        //decrypt and compare password
                        let checkPassword = CommonService.compareHash(option);
                        if (user.verified !== 1) {
                            return res.json({
                                "code": 400,
                                "status": "Error",
                                "message": "Your account still not verified,please verified it first"
                            });
                        } else if (!checkPassword) {
                            return res.json({
                                "code": 400,
                                "status": "Error",
                                "message": "Your password does not match,please try again"
                            });
                        } else {
                            let updateparams = {
                                sequelize: sequelize,
                                connection: connection,
                                params: user,
                            };
                            CommonService.commonSingleUpdaterAndGet(updateparams, function (err, userInfo) {
                                if (err) {
                                    return res.json({
                                        "code": 400,
                                        "message": "Error",
                                        "data": {},
                                    });
                                } else {
                                    const userProfile = {
                                        id: userInfo.id,
                                        firstName: userInfo.firstName,
                                        lastName: userInfo.lastName,
                                        userName: userInfo.userName,
                                        email: userInfo.email,
                                        status: userInfo.status,
                                        type: userInfo.type
                                    };
                                    let token = jwt.sign(userProfile, config.secret, {expiresIn: config.updatedTokenExpires});
                                    return res.json({
                                        "code": 200,
                                        "message": "success",
                                        "data": userInfo,
                                        "token": token
                                    });
                                }
                            })
                        }
                    }
                ])
            }
        } catch (err) {
            throw(err);
        }
    },
    /**
     *
     * @param req
     * @param res
     */
    create: async (req, res) => {
        let params = req.body;
        let fullUrl = req.get('Origin');
        console.log("In----req", params);

        try {
            //check required field
            let isValid = ValidateService.checkCommonValidation(params);
            let reqValid = ValidateService.checkCreateReqValidation(params);
            const emailValid = CommonService.emailValidator(params.email);
            if (!isValid) {
                return res.json({
                    "code": 400,
                    "status": "Error",
                    "message": "Please enter proper data"
                });
            } else if (!reqValid) {
                return res.json({
                    "code": 400,
                    "status": "Error",
                    "message": "Please enter required data"
                });
            } else if (!emailValid) {
                return res.json({
                    "code": 400,
                    "status": "Error",
                    "message": "Please enter correct email address"
                });
            } else {
                async.waterfall([
                    function (wcb) {
                        console.log("In--Check");
                        var select_sql = heredoc(function () {/*
                        SELECT * FROM users WHERE email=:email OR userName=:userName
                        */
                        });
                        connection.query(select_sql, {
                            type: sequelize.QueryTypes.SELECT,
                            replacements: {
                                email: params.email,
                                userName: params.userName
                            }
                        }).then((users) => {
                            console.log("Existttt", users);
                            if (users && users.length > 0) {
                                if (users[0].userName) {
                                    return res.json({
                                        "code": 400,
                                        "message": "Email/UserName Already Exists",
                                        "data": {},
                                    });
                                } else {
                                    wcb(null, users[0])
                                }
                            } else {
                                wcb(null, null)
                            }
                        }).catch((err) => {
                            return res.json({
                                "code": 400,
                                "message": "Error",
                                "data": err,
                            });
                        });
                    },
                    function (originalUser, wcb) {
                        const user = {
                            email: params.email
                        };
                        const randomToken = CommonService.randomStringGenerator(16, "aA#");
                        console.log("In--Notification");
                        user.subject = "Account Verification";
                        user.successMsg = "Please check your " + user.email + " email to verify your account.";
                        user.mailMsg = `Click <a href="` + fullUrl + `/api/auth/verify-user-account/` + randomToken + `">`
                            + fullUrl + `/api/auth/verify-user-account/` + randomToken
                            + `</a> to verify your account...`; // plaintext body

                        NotificationService.emailNotification(user, function (err, result) {
                            if (err) {
                                res.json({
                                    "code": 400,
                                    "data": {},
                                    "status": "failed",
                                    "message": "Fail to send email",
                                });
                            } else if (result && result.flag === true) {
                                console.log("Result----", result);
                                wcb(null, result.message, randomToken, originalUser)
                            } else {
                                console.log("in-Failed");
                                res.json({
                                    "code": 500,
                                    "status": "Fail",
                                    "message": "Fail to send email",
                                });
                            }
                        })
                    },
                    async function (message, randomToken, originalUser, wcb) {
                        //image convertor
                        if (params.profile) {
                            let imagePath = CommonService.convertBase64Image(params.profile);
                            if (imagePath) {
                                params.profile = req.protocol + "://" + req.headers.host + imagePath.split('./files')[1];
                            }
                        }
                        //decrypt password for security
                        if (params.password) {
                            let password = CommonService.generateHash(params.password);
                            if (password) {
                                params.password = password
                            }
                        }
                        try {
                            let userdata;
                            const replacements = {
                                firstName: params.firstName,
                                lastName: params.lastName,
                                userName: params.userName,
                                email: params.email,
                                profile: params.profile ? params.profile : "",
                                status: params.status ? params.status : constants.loginStatus.ONLINE,
                                forgotPasswordCode: params.forgotPasswordCode ? params.forgotPasswordCode : "",
                                password: params.password
                            };
                            if (!originalUser) {
                                const insertSql = heredoc(function () {/*
                                INSERT INTO users
                                ( firstName,lastName,userName,email, profile,status,forgotPasswordCode, password)
                                VALUES (:firstName,:lastName,:userName,:email,:profile,:status,:forgotPasswordCode,:password);
                                */
                                });
                                userdata = await connection.query(insertSql, {
                                    type: sequelize.QueryTypes.INSERT,
                                    replacements
                                });
                            } else {
                                const updateSql = heredoc(function () {/*
                                UPDATE users
                                SET firstName=:firstName,lastName=:lastName,userName=:userName,
                                profile=:profile,status=:status,forgotPasswordCode=:forgotPasswordCode, password=:password
                                WHERE email=:email
                                */
                                });
                                userdata = await connection.query(updateSql, {
                                    type: sequelize.QueryTypes.UPDATE,
                                    replacements
                                });
                            }
                            console.log("Data:===", userdata);
                            if (userdata.length !== 0) {
                                let myNewId = originalUser ? originalUser.id : userdata[0];
                                console.log("My--Id", myNewId);

                                const insertedDataSql = heredoc(function () {/*
                                SELECT * FROM joined_communities WHERE userId=:myId
                                */
                                });
                                const insertedData = await connection.query(insertedDataSql, {
                                    type: sequelize.QueryTypes.SELECT,
                                    replacements: {
                                        myId: myNewId
                                    }
                                });
                                if (insertedData.length <= 0) {
                                    const communitySelectSql = heredoc(function () {/*
                                    SELECT id FROM community
                                    */
                                    });
                                    const communityIds = await connection.query(communitySelectSql, {
                                        type: sequelize.QueryTypes.SELECT,
                                    });

                                    const communityInsertSql = heredoc(function () {/*
                                    INSERT INTO joined_communities
                                    (userId,communityId)
                                    VALUES (:userId,:communityId)
                                    */
                                    });
                                    await Promise.all(communityIds.map(
                                        async communityData => connection.query(communityInsertSql, {
                                            type: sequelize.QueryTypes.INSERT,
                                            replacements: {
                                                userId: myNewId,
                                                communityId: communityData.id
                                            }
                                        })
                                    ));
                                }
                                //getting saved data in all
                                CommonService.commonSaveGetter(myNewId, function (err, user) {
                                    if (err) {
                                        res.json({
                                            "code": 400,
                                            "data": {},
                                            "status": "Error",
                                            "message": "Failed"
                                        });
                                    } else if (user && user !== {}) {
                                        verifyCode[randomToken] = user.id;
                                        res.json({
                                            "code": 200,
                                            "data": user,
                                            "status": "Success",
                                            "message": message,
                                        });
                                    } else {
                                        res.json({
                                            "code": 400,
                                            "data": {},
                                            "status": "Error",
                                            "message": "Failed"
                                        });
                                    }
                                })
                            } else {
                                return res.json({
                                    "code": 404,
                                    "message": "Failed",
                                    "data": {},
                                });
                            }
                        } catch (e) {
                            return res.json({
                                code: 500,
                                status: 'Fail',
                                message: e.message,
                            });
                        }
                    }
                ])
            }
        } catch (err) {
            console.error(err);
            res.json({
                "code": 500,
                "data": {},
                "status": "Fail",
                "message": err.message
            });
        }
    },

    /**
     * @desc get user profile detail
     * @param req
     * @param res
     * @returns {Promise<*|Sequelize.json|Promise<any>>}
     */
    profile: async (req, res) => {
        let params = req.params;
        console.log("In---Profile", params);
        try {
            //check required field
            let isValid = ValidateService.checkCommonValidation(params);
            let reqValid = ValidateService.checkCommonUpdateReqValidation(params);
            if (!isValid) {
                return res.json({
                    "code": 400,
                    "status": "Error",
                    "message": "Please enter proper data"
                });
            } else if (!reqValid) {
                return res.json({
                    "code": 400,
                    "status": "Error",
                    "message": "Please enter required data"
                });
            } else {
                async.waterfall([
                    //check user exist or not
                    function (wcb) {
                        var select_sql = heredoc(function () {/*
                        SELECT * FROM users WHERE id=:id
                        */
                        });
                        connection.query(select_sql, {
                            type: sequelize.QueryTypes.SELECT,
                            replacements: {
                                id: params.id
                            }
                        }).then(user => {
                                if (user && user.length === 0) {
                                    return res.json({
                                        "code": 404,
                                        "status": "Error",
                                        "message": "User not found"
                                    });
                                }
                                return res.json({
                                    "code": 200,
                                    "status": "Success",
                                    "message": "Success",
                                    "data": user
                                });
                            }
                        ).catch((err) => {
                            return res.json({
                                "code": 400,
                                "message": "Error",
                                "data": err,
                            });
                        });
                    },
                ])
            }
        } catch (err) {
            throw(err);
        }
    },

    /**
     * @desc : forgot password for send
     * email for new password
     * @param req {"email":""}
     * @param res
     * @returns {*|Sequelize.json|Promise<any>}
     */
    forgotPassword: function (req, res) {
        let params = req.body;
        let fullUrl = req.protocol + '://' + req.get('host');
        console.log("In---Forgot", params);
        try {
            //check required field
            let isValid = ValidateService.checkCommonValidation(params);
            let reqValid = ValidateService.checkForgotReqValidation(params);
            if (!isValid) {
                return res.json({
                    "code": 400,
                    "status": "Error",
                    "message": "Please enter proper data"
                });
            } else if (!reqValid) {
                return res.json({
                    "code": 400,
                    "status": "Error",
                    "message": "Please enter required data"
                });
            } else {
                async.waterfall([
                    //check user exist or not
                    function (wcb) {
                        console.log("In--Check");
                        var select_sql = heredoc(function () {/*
                        SELECT * FROM users WHERE email=:email
                        */
                        });
                        connection.query(select_sql, {
                            type: sequelize.QueryTypes.SELECT,
                            replacements: {
                                email: params.email,
                            }
                        }).then((users) => {
                            if (users && users.length > 0) {
                                console.log("Existttt", users.length);
                                wcb(null, _.first(users))
                            } else {
                                return res.json({
                                    "code": 400,
                                    "message": "User Not Found",
                                    "data": {},
                                });
                            }
                        }).catch((err) => {
                            return res.json({
                                "code": 400,
                                "message": "Error",
                                "data": err,
                            });
                        });
                    },
                    function (user, wcb) {
                        console.log("My--User", user);
                        let linkExpirationCode = CommonService.randomStringGenerator(10, '#aA');
                        forgotPasswordCode[linkExpirationCode] = user.id;
                        const mailOptions = {
                            email: user.email,
                            mailMsg: 'Click on the link to reset your password..<br/>' +
                                '<a href="' + fullUrl + '/api/auth/forgot-password-change/' + linkExpirationCode + '">'
                                + fullUrl + '/api/auth/forgot-password-change/' + linkExpirationCode + '</a>', // plaintext body
                            successMsg: "Link for resetting password is sent on your email " + user.email,
                            subject: "Reset Your Password"
                        };
                        NotificationService.emailNotification(mailOptions, function (err, result) {
                            if (err) {
                                console.log("Errr--", error);
                                return res.json({"code": 400, "message": "Fail to send email"});
                            } else {
                                if (result.flag) {
                                    return res.json({
                                        "code": 200,
                                        "message": result.message,
                                    });
                                } else {
                                    return res.json({
                                        "code": 500,
                                        "message": result.message,
                                    });
                                }
                            }
                        });
                    }
                ])
            }
        } catch (err) {
            throw(err);
        }
    },

    /**
     * @desc : redirect to generate new password
     * @param req
     * @param res
     */
    forgotPasswordPage: function (req, res) {
        let params = req.params || req.body;
        console.log("In---Pass-PageforgotPasswordCode", forgotPasswordCode);
        userId = forgotPasswordCode[params.code];
        let linkCode = params.code;
        try {
            async.waterfall([
                //check user exist or not
                function (wcb) {
                    console.log("In--Check");
                    var select_sql = heredoc(function () {/*
                    SELECT * FROM users WHERE id=:userId
                    */
                    });
                    connection.query(select_sql, {
                        type: sequelize.QueryTypes.SELECT,
                        replacements: {
                            userId,
                        }
                    }).then((users) => {
                        if (users && users.length > 0) {
                            let userExist = _.first(users);
                            if (userExist.forgotPasswordCode === linkCode) {
                                res.send('This link is expired !!! <br> please generate new one to reset your password.')
                            } else {
                                res.render('forgotPassword', {
                                    userId: userId,
                                    status: false,
                                    message: "",
                                    linkCode: linkCode
                                })
                            }
                        } else {
                            return res.json({
                                "code": 400,
                                "message": "User Not Found",
                                "data": {},
                            });
                        }
                    }).catch((err) => {
                        return res.json({
                            "code": 400,
                            "message": "Error",
                            "data": err,
                        });
                    });
                },
            ])
        } catch (err) {
            throw(err);
        }
    },

    /**
     * @author : AMit
     * @desc : update new password for login
     * @param req {"password":"",cpassword:""}
     * @param res
     */
    updatePassword: function (req, res) {
        let params = req.body;
        const url = req.get('Origin');
        console.log("In----Update", JSON.stringify(params));
        try {
            if (params.password === params.cpassword) {
                //check user exist or not
                console.log("In--Check--Update");
                var select_sql = heredoc(function () {/*
                SELECT * FROM users WHERE id=:userId
                */
                });
                connection.query(select_sql, {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: {
                        userId: params.userId,
                    }
                }).then((users) => {
                    if (users && users.length > 0) {
                        let user = _.first(users);
                        let newPassword = CommonService.generateHash(params.password);
                        var sql = heredoc(function () {/*
                        UPDATE  users SET
                        password=:password,
                        forgotPasswordCode=:forgotPasswordCode
                        WHERE
                        id=:id;
                        */
                        });
                        connection.query(sql, {
                            type: sequelize.QueryTypes.UPDATE,
                            replacements: {
                                password: newPassword,
                                forgotPasswordCode: params.code,
                                id: params.userId,
                            },
                        }).then(function (data) {
                            console.log("Data--------", data);
                            if (data && data.length) {
                                res.render('forgotPassword', {
                                    message: "Password changed successfully",
                                    status: true,
                                    userId: "",
                                    linkCode: url
                                });
                            } else {
                                res.render('forgotPassword', {
                                    message: "Couldn't reset password at this moment",
                                    status: false,
                                    userId: "",
                                    linkCode: ""
                                });
                            }
                        }).catch(function (err) {
                            if (err) throw err;
                        });
                    } else {
                        return res.json({
                            "code": 400,
                            "message": "User Not Found",
                            "data": {},
                        });
                    }
                }).catch((err) => {
                    return res.json({
                        "code": 400,
                        "message": "Error",
                        "data": err,
                    });
                });
            } else {
                res.render('forgotPassword', {
                    message: "Confirm Password Doesn't Matched !!!",
                    status: false,
                    userId: params.userId,
                    linkCode: params.code
                });
            }
        } catch (err) {
            throw(err);
        }
    },

    /**
     * @desc : verify new register user
     * @param req
     * @param res
     * @returns {*|Sequelize.json|Promise<any>}
     */
    verifyNewUser: function (req, res) {
        const fullUrl = req.protocol + '://' + req.get('host');
        userId = verifyCode[req.params.userToken];
        try {
            if (userId) {
                //check user exist or not
                console.log("In--Check--Verify");
                var select_sql = heredoc(function () {/*
                SELECT * FROM users WHERE id=:userId
                */
                });
                connection.query(select_sql, {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: {
                        userId: userId,
                    }
                }).then((users) => {
                    if (users && users.length > 0) {
                        let user = _.first(users);
                        var sql = heredoc(function () {/*
                        UPDATE  users SET verified=:verified WHERE id=:id;
                        */
                        });
                        connection.query(sql, {
                            type: sequelize.QueryTypes.UPDATE,
                            replacements: {
                                verified: constants.verifiedUserType.VERIFIED, //true
                                id: userId,
                                // uid: req.body.uid ? req.body.uid : ""
                            },
                        }).then(function (data) {
                            console.log("Data--------", data);
                            if (data && data.length) {
                                res.render('accountSuccess', {
                                    status: true,
                                    fullUrl
                                })
                            } else {
                                res.json({
                                    "code": 400,
                                    "data": {},
                                    "status": "failed",
                                    "message": "failed"
                                });
                            }
                        }).catch(function (err) {
                            if (err) return res.json({
                                "code": 500,
                                "message": err.message,
                                "data": {},
                            });
                        });
                    } else {
                        return res.json({
                            "code": 400,
                            "message": "User Not Found",
                            "data": {},
                        });
                    }
                }).catch((err) => {
                    return res.json({
                        "code": 400,
                        "message": err.message,
                        "data": {},
                    });
                });
            } else {
                return res.json({
                    "code": 404,
                    "message": "User Not Found",
                    "data": {},
                });
            }
        } catch (err) {
            return res.json({
                "code": 500,
                "message": err.message,
                "data": {},
            });
        }
    },
};