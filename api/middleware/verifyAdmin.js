const heredoc = require('heredoc');
const config = require('../config/database.js');
const sequelize = require('sequelize');
const connection = config.connection;
const constants = require('../constants');
module.exports = (req, res, next) => {
    let communityId = req.params.communityId || req.body.communityId || req.query.communityId || req.headers.communityId;
    let loginUser = req.user;
    if (communityId) {
        const select_sql = heredoc(function () {/*
        SELECT * FROM joined_communities WHERE userId=:adminId AND communityId=:communityId AND role=:adminRole
        */
        });
        connection.query(select_sql, {
            type: sequelize.QueryTypes.SELECT,
            replacements: {
                adminId: loginUser.id,
                communityId,
                adminRole: constants.userType.ADMIN
            }
        }).then(admins => {
            console.log("admin-- Data", admins[0]);
            if (admins && admins.length > 0) {
                req.admin = admins[0];
                next()
            } else {
                return res.json({
                    "code": 403,
                    "message": "Access Denied",
                    "data": [],
                })
            }
        }).catch(e => {
            return res.json({
                "code": 500,
                "message": e.message,
                "data": [],
            })
        });
    } else {
        return res.json({
            "code": 403,
            "message": "Access Denied",
            "data": [],
        })
    }
};