const heredoc = require('heredoc');
const config = require('../config/database.js');
const sequelize = require('sequelize');
const connection = config.connection;
const constants = require('../constants');
module.exports = (req, res, next) => {
    let loginUser = req.user;
    const select_sql = heredoc(function () {/*
    SELECT * FROM joined_communities WHERE userId=:superAdminId AND role=:superAdminRole
    */
    });
    connection.query(select_sql, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
            superAdminId: loginUser.id,
            superAdminRole: constants.userType.SUPER_ADMIN
        }
    }).then(superAdmins => {
        console.log("superAdmin-- Data", superAdmins[0]);
        if (superAdmins && superAdmins.length > 0) {
            req.superAdmin = superAdmins[0];
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
};