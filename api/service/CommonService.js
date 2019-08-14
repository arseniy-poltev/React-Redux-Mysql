const request = require('request');
const heredoc = require('heredoc');
const fs = require('fs');
const bcrypt = require('bcrypt-nodejs');
const nodemailer = require("nodemailer");
const path = require('path');
const _ = require('lodash');
const templatesDir = path.resolve(__dirname, '../..', 'views');
const config = require('../config/database.js');
const sequelize = require('sequelize');
const connection = config.connection;
const constants = require('../constants');

//const emailTemplates = require('email-templates');
const async = require('async');
module.exports = {
    convertBase64Image: async function (profile) {
        let imagePath;
        let base64Data;
        let data = profile.split(';');
        const randomNumber = this.randomStringGenerator(25, '#aA');
        if (data[0] === "data:image/1") {
            imagePath = './files/' + randomNumber + '.png';
            base64Data = profile.replace(/^data:image\/1;base64,/, "");
        } else if (data[0] === "data:image/*") {
            const base64 = data[2].split(",");
            base64Data = base64[1];
            data = base64[1].substring(0, 8);
            if (data === "/9j/4AAQ") {
                imagePath = './files/' + randomNumber + '.jpeg';
            } else {
                imagePath = './files/' + randomNumber + '.png';
            }
        } else if (data[0] === "data:image/png") {
            imagePath = './files/' + randomNumber + '.png';
            base64Data = profile.replace(/^data:image\/png;base64,/, "");
        } else if (data[0] === "data:image/jpeg") {
            imagePath = './files/' + randomNumber + '.jpeg';
            base64Data = profile.replace(/^data:image\/jpeg;base64,/, "");
        } else {
            console.log("image invalid");
            throw new Error(`Image Invalid`);
        }
        console.log("imagePath-----------1111", imagePath);
        try {
            await fs.writeFileSync(imagePath, base64Data, 'base64');
            return imagePath;
        } catch (e) {
            console.log('err: ', e);
            throw new Error(`Base64 Image is not converted`);
        }
    },
    /**
     * @desc : encrypt password
     * @param password
     * @returns {*}
     */
    generateHash: function (password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    },

    /**
     * @desc: decrypt password
     * @param params
     * @returns {boolean}
     */
    compareHash: function (params) {
        let encryptedPassword = params.user && params.user.password ? params.user.password : "";
        return bcrypt.compareSync(params.password, encryptedPassword)
    },

    emailValidator: params => {
        let mailFormat = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        return mailFormat.test(params) !== false;
    },

    commonSingleUpdaterAndGet: function (params, callback) {
        let sequelize = params.sequelize;
        let connection = params.connection;
        let parameter = params.params;
        console.log("In--My--Service", parameter);
        async.waterfall([
            function (wcb) {
                var select_sql = heredoc(function () {/*
                SELECT * FROM users WHERE id=:id
                */
                });
                connection.query(select_sql, {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: {
                        id: parameter.id
                    }
                }).then(function (users) {
                    console.log("In--user---", users);
                    if (users.length > 0) {
                        wcb(null, _.first(users))
                    } else {
                        callback(null, {})
                    }
                })
            },
            function (user, wcb) {
                var select_sql = heredoc(function () {/*
                SELECT community.*,joins.role
                FROM (SELECT * FROM joined_communities WHERE userId=:userId AND status=:status) joins
                LEFT JOIN community ON joins.communityId=community.id
                */
                });
                connection.query(select_sql, {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: {
                        userId: user.id,
                        status: constants.userJoinStatus.ACCEPTED
                    }
                }).then(function (communities) {
                    console.log("In--communities---", communities);
                    callback(null, {
                        ...user,
                        communities: communities.filter(community => community.id)
                    })
                })
            }
        ])
    },

    commonSaveGetter: function (params, callback) {
        var select_sql = heredoc(function () {/*
        SELECT * FROM users WHERE id=:id
        */
        });
        connection.query(select_sql, {
            type: sequelize.QueryTypes.SELECT,
            replacements: {
                id: params,
            }
        }).then((users) => {
            if (users && users.length > 0) {
                console.log("Existttt", users.length);
                callback(null, _.first(users))
            } else {
                callback(null, {})
            }
        }).catch((err) => {
            throw err
        });
    },

    commonSaveActivityGetter: function (params, callback) {
        var select_sql = heredoc(function () {/*
        SELECT * FROM activity WHERE id=:id
        */
        });
        connection.query(select_sql, {
            type: sequelize.QueryTypes.SELECT,
            replacements: {
                id: params,
            }
        }).then((activities) => {
            if (activities && activities.length > 0) {
                console.log("activities-Existttt", activities.length);
                const activity = _.first(activities);
                var select_sql = heredoc(function () {/*
                SELECT * FROM accept WHERE activityId=:activityId
                */
                });
                connection.query(select_sql, {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: {
                        activityId: activity.id,
                    }
                }).then((accepts) => {
                    if (accepts && accepts.length > 0) {
                        console.log("accepts-Existttt", accepts.length);
                        callback(null, activity, accepts)
                    } else {
                        callback(null, activity, [])
                    }
                }).catch((err) => {
                    throw err
                });
            } else {
                callback(null, {}, null)
            }
        }).catch((err) => {
            throw err
        });
    },
    randomStringGenerator: (length, chars) => {
        let mask = '';
        if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
        if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (chars.indexOf('#') > -1) mask += '0123456789';
        let result = '';
        for (let i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
        return result;
    }
};