let heredoc = require('heredoc');
let sequelize = require('sequelize');
let config = require('../config/database.js');
const async = require('async');
const constants = require('../constants');
const NotificationService = require("../service/NotificationService");
let connection = config.connection;

module.exports = {
    /**
     * @desc : getting list of activity
     * as per login
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    allCommunityInfo: async (req, res) => {
        let communityId = req.params.communityId;
        async.waterfall([
            function (wcb) {
                const select_sql = heredoc(function () {/*
                SELECT allUsers.*,joins.status
                FROM (SELECT * FROM joined_communities WHERE communityId=:communityId AND role=:userRole AND status!=:statusUnJoined) joins
                LEFT JOIN (SELECT id,firstName,lastName,userName,email FROM users WHERE verified=:verified) allUsers
                ON joins.userId=allUsers.id
                */
                });
                connection.query(select_sql, {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: {
                        communityId,
                        userRole: constants.userType.USER,
                        statusUnJoined: constants.userJoinStatus.UNJOINED,
                        verified: constants.verifiedUserType.VERIFIED
                    }
                }).then(allUsers => {
                    console.log("allUsers-Length", allUsers.filter(user => user.id).length);
                    wcb(null, allUsers.filter(user => user.id));
                }).catch(error => {
                    console.log(error);
                    return res.json({
                        "code": 500,
                        "message": e.message,
                        "status": 'Fail',
                    })
                })
            },
            function (allUsers, wcb) {
                const select_sql = heredoc(function () {/*
                SELECT activity.*,users.userName,users.firstName,users.lastName,users.email
                FROM activity LEFT JOIN users ON activity.userId=users.id
                WHERE activity.communityId=:communityId
                */
                });
                connection.query(select_sql, {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: {
                        communityId,
                    }
                }).then(activities => {
                    console.log("Activity-Length", activities.length);
                    wcb(null, allUsers, activities);
                }).catch(e => {
                    return res.json({
                        "code": 500,
                        "message": e.message,
                        "status": 'Fail',
                    });
                });
            },

            //data for admin and super admin
            async function (allUsers, activities, wcb) {
                const result = await Promise.all(activities.map(async activity => {
                    var select_sql = heredoc(function () {/*
                    SELECT * FROM accept WHERE activityId=:activityId
                    */
                    });
                    try {
                        const accepts = await connection.query(select_sql, {
                            type: sequelize.QueryTypes.SELECT,
                            replacements: {
                                activityId: activity.id
                            }
                        });
                        return {
                            ...activity,
                            accepts
                        }
                    } catch (e) {
                        console.error(e)
                    }
                }));
                return res.json({
                    "code": 200,
                    "message": "success",
                    "data": {
                        users: allUsers,
                        activities: result
                    },
                    "token": req.token
                });
            }
        ]);
    },
    approveUsers: async function (req, res) {
        const {communityId, userIds} = req.body;
        console.log("Request hostname: ", req.headers['origin']); //Same with req.get('origin')
        let fullUrl = req.get('origin');
        const select_sql = heredoc(function () {/*
        SELECT users.email FROM
        (SELECT * FROM joined_communities
        WHERE userId=:userId AND communityId=:communityId AND role=:userRole AND status=:statusRequestJoin) joins
        LEFT JOIN users ON joins.userId=users.id WHERE users.id=:userId
        */
        });
        const select_community_sql = heredoc(function () {/*
        SELECT * FROM community WHERE id=:communityId
        */
        });
        try {
            const community = await connection.query(select_community_sql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    communityId,
                }
            });
            const userData = await Promise.all(
                userIds.map(async userId => connection.query(select_sql, {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: {
                        userId,
                        communityId,
                        userRole: constants.userType.USER,
                        statusRequestJoin: constants.userJoinStatus.REQUEST_JOIN
                    }
                }))
            );
            console.log("User --Data", userData);
            console.log("In--Notification");
            const user = {};
            let email = '';
            userData.map(aUser => {
                if (aUser.length > 0) email += aUser[0].email + `,`;
            });
            user.email = email;
            user.subject = "Community Approval";
            user.successMsg = `Successfully sent emails to notify requests were approved to the following emails ${user.email}`;
            user.mailMsg = `Your request to join to our community "${community[0].name}" was approved.\n Please login to our AngelHost ${fullUrl}`; // plaintext body
            const update_sql = heredoc(function () {/*
            UPDATE joined_communities SET status=:statusAccept
            WHERE userId=:userId AND communityId=:communityId AND role=:userRole AND status=:statusRequestJoin
            */
            });
            NotificationService.emailNotification(user, async function (err, result) {
                if (err) {
                    res.json({
                        "code": 400,
                        "data": {},
                        "status": "failed",
                        "message": "failed"
                    });
                } else if (result && result.flag === true) {
                    const updatedData = await Promise.all(
                        userIds.map(async userId => connection.query(update_sql, {
                            type: sequelize.QueryTypes.UPDATE,
                            replacements: {
                                statusAccept: constants.userJoinStatus.ACCEPTED,
                                userId,
                                communityId,
                                userRole: constants.userType.USER,
                                statusRequestJoin: constants.userJoinStatus.REQUEST_JOIN
                            }
                        }))
                    );
                    console.log("updatedData-Length", updatedData);
                    console.log("Result----", result);
                    return res.json({
                        "code": 200,
                        "message": result.message,
                        "data": [],
                        "token": req.token
                    });
                } else {
                    console.log("in-Failed");
                    return res.json({
                        "code": 500,
                        "data": user,
                        "status": "Fail",
                        "message": "Fail to send email"
                    });
                }
            });
        } catch (e) {
            console.log(e);
            return res.json({
                "code": 500,
                "status": "Fail",
                "message": e.message
            });
        }
    },
    removeUsers: async function (req, res) {
        const {communityId, userIds} = req.body;
        console.log("Request hostname: ", req.headers['origin']); //Same with req.get('origin')
        let fullUrl = req.get('origin');
        const select_sql = heredoc(function () {/*
        SELECT users.email FROM
        (SELECT * FROM joined_communities
        WHERE userId=:userId AND communityId=:communityId AND role=:userRole AND status!=:statusUnJoined) joins
        LEFT JOIN users ON joins.userId=users.id WHERE users.id=:userId
        */
        });
        const select_community_sql = heredoc(function () {/*
        SELECT * FROM community WHERE id=:communityId
        */
        });
        try {
            const community = await connection.query(select_community_sql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    communityId,
                }
            });
            const userData = await Promise.all(
                userIds.map(async userId => connection.query(select_sql, {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: {
                        userId,
                        communityId,
                        userRole: constants.userType.USER,
                        statusUnJoined: constants.userJoinStatus.UNJOINED
                    }
                }))
            );
            console.log("User --Data", userData);
            console.log("In--Notification");
            const user = {};
            let email = '';
            userData.map(aUser => {
                if (aUser.length > 0) email += aUser[0].email + `,`;
            });
            user.email = email;
            user.subject = "Community Notification";
            user.successMsg = `Successfully sent emails to notify users were removed to the following emails ${user.email}`;
            user.mailMsg = `Your account was removed from our community "${community[0].name}".\n Please login to our AngelHost ${fullUrl}`; // plaintext body
            const update_sql = heredoc(function () {/*
            UPDATE joined_communities SET status=:statusUnJoined
            WHERE userId=:userId AND communityId=:communityId AND role=:userRole AND status!=:statusUnJoined
            */
            });
            NotificationService.emailNotification(user, async function (err, result) {
                if (err) {
                    res.json({
                        "code": 400,
                        "data": {},
                        "status": "failed",
                        "message": "failed"
                    });
                } else if (result && result.flag === true) {
                    const updatedData = await Promise.all(
                        userIds.map(async userId => connection.query(update_sql, {
                            type: sequelize.QueryTypes.UPDATE,
                            replacements: {
                                statusUnJoined: constants.userJoinStatus.UNJOINED,
                                userId,
                                communityId,
                                userRole: constants.userType.USER,
                            }
                        }))
                    );
                    console.log("updatedData-Length", updatedData);
                    console.log("Result----", result);
                    return res.json({
                        "code": 200,
                        "message": result.message,
                        "data": [],
                        "token": req.token
                    });
                } else {
                    console.log("in-Failed");
                    return res.json({
                        "code": 500,
                        "data": user,
                        "status": "Fail",
                        "message": "Fail to send email"
                    });
                }
            });
        } catch (e) {
            console.log(e);
            return res.json({
                "code": 500,
                "status": "failed",
                "message": e.message
            })
        }
    },
    removeCards: async function (req, res) {
        const {cardIds} = req.body;
        const delete_sql = heredoc(function () {/*
        DELETE FROM activity WHERE id=:id
        */
        });
        try {
            const deletedData = await Promise.all(
                cardIds.map(async id => connection.query(delete_sql, {
                    type: sequelize.QueryTypes.DELETE,
                    replacements: {id}
                }))
            );
            console.log("deletedData---", deletedData);
            return res.json({
                "code": 200,
                "message": "Success",
                "data": [],
                "token": req.token
            });
        } catch (e) {
            console.log(e);
            return res.json({
                "code": 500,
                "message": e.message,
                "status": "Fail",
            });
        }
    },
    allUsersToInvite: async function (req, res) {
        const {communityId} = req.params;
        const select_sql = heredoc(function () {/*
        SELECT allUsers.* FROM
        (SELECT * FROM joined_communities
        WHERE role=:userRole AND communityId=:communityId AND status=:statusUnJoined) joins
        LEFT JOIN (SELECT id,firstName,lastName,userName,email FROM users WHERE verified=:verified) allUsers ON joins.userId=allUsers.id
        */
        });
        try {
            const selectedData = await connection.query(select_sql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    userRole: constants.userType.USER,
                    communityId,
                    statusUnJoined: constants.userJoinStatus.UNJOINED,
                    verified: constants.verifiedUserType.VERIFIED
                }
            });
            console.log("selectedData---Length", selectedData.length);
            const realData = selectedData.filter(user => user.id);
            if (realData.length > 0) {
                return res.json({
                    "code": 200,
                    "message": "Success",
                    "data": realData,
                    "token": req.token
                });
            } else {
                return res.json({
                    "code": 404,
                    "message": "Not Found Data",
                    "data": [],
                });
            }
        } catch (e) {
            console.log(e);
            return res.json({
                "code": 500,
                "message": e.message,
                "status": "Fail",
            });
        }
    },
    addNewUsers: async function (req, res) {
        const {communityId, userIds} = req.body;
        console.log("Request hostname: ", req.headers['origin']); //Same with req.get('origin')
        let fullUrl = req.get('origin');
        const select_sql = heredoc(function () {/*
        SELECT users.email FROM
        (SELECT * FROM joined_communities
        WHERE userId=:userId AND communityId=:communityId AND role=:userRole AND status=:statusUnJoined) joins
        LEFT JOIN users ON joins.userId=users.id WHERE users.id=:userId
        */
        });
        const select_community_sql = heredoc(function () {/*
        SELECT * FROM community WHERE id=:communityId
        */
        });
        try {
            const community = await connection.query(select_community_sql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    communityId,
                }
            });
            const userData = await Promise.all(
                userIds.map(async userId => connection.query(select_sql, {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: {
                        userId,
                        communityId,
                        userRole: constants.userType.USER,
                        statusUnJoined: constants.userJoinStatus.UNJOINED
                    }
                }))
            );
            console.log("User --Data", userData);
            console.log("In--Notification");
            const user = {};
            let email = '';
            userData.map(aUser => {
                if (aUser.length > 0) email += aUser[0].email + `,`;
            });
            user.email = email;
            user.subject = "Community Invitation";
            user.successMsg = `Successfully sent emails to notify users were invited to the following emails ${user.email}`;
            user.mailMsg = `You were invited to our community "${community[0].name}".\n Please login to our AngelHost ${fullUrl}`; // plaintext body
            const update_sql = heredoc(function () {/*
            UPDATE joined_communities SET status=:statusAccepted
            WHERE userId=:userId AND communityId=:communityId AND role=:userRole AND status=:statusUnJoined
            */
            });
            NotificationService.emailNotification(user, async function (err, result) {
                if (err) {
                    res.json({
                        "code": 400,
                        "data": {},
                        "status": "failed",
                        "message": "failed"
                    });
                } else if (result && result.flag === true) {
                    const updatedData = await Promise.all(
                        userIds.map(async userId => connection.query(update_sql, {
                            type: sequelize.QueryTypes.UPDATE,
                            replacements: {
                                statusUnJoined: constants.userJoinStatus.UNJOINED,
                                statusAccepted: constants.userJoinStatus.ACCEPTED,
                                userId,
                                communityId,
                                userRole: constants.userType.USER,
                            }
                        }))
                    );
                    console.log("updatedData-Length", updatedData);
                    console.log("Result----", result);
                    return res.json({
                        "code": 200,
                        "message": result.message,
                        "data": [],
                        "token": req.token
                    });
                } else {
                    console.log("in-Failed");
                    return res.json({
                        "code": 500,
                        "data": user,
                        "status": "Fail",
                        "message": "Fail to send email"
                    });
                }
            });
        } catch (e) {
            console.log(e);
            return res.json({
                "code": 500,
                "status": "failed",
                "message": e.message
            })
        }
    },
    getAllUsersInWebsite: async function (req, res) {
        const select_users_sql = heredoc(function () {/*
        SELECT users.id,users.firstName,users.lastName,users.userName,users.email FROM users
        */
        });
        try {
            const users = await connection.query(select_users_sql, {
                type: sequelize.QueryTypes.SELECT,
            });
            if (users.length > 0) {
                return res.json({
                    code: 200,
                    message: 'Success',
                    data: users,
                    token: req.token
                })
            } else {
                return res.json({
                    code: 404,
                    status: 'Fail',
                    message: 'Not Found User',
                    data: []
                })
            }
        } catch (e) {
            console.log(e);
            return res.json({
                code: 500,
                status: 'Fail',
                message: e.message
            })
        }
    },
    insertNewEmail: async function (req, res) {
        const {email, communityId} = req.body;
        let fullUrl = req.get('Origin');
        const select_community_sql = heredoc(function () {/*
        SELECT * FROM community WHERE id=:communityId
        */
        });
        const community = await connection.query(select_community_sql, {
            type: sequelize.QueryTypes.SELECT,
            replacements: {
                communityId,
            }
        });
        const emailParams = {
            mailMsg: `A community ${community[0].name} of "AngelHosts" website invited you.<br/>
                Click <a href="${fullUrl}/#/register/?email=${email}">${fullUrl}/#/register/?email=${email}</a> to register your account`,
            subject: `AngelHosts invited you`,
            email
        };
        NotificationService.emailNotification(emailParams, async (err, result) => {
            if (err) {
                res.json({
                    "code": 400,
                    "status": "failed",
                    "message": "Fail to send email",
                });
            } else if (result && result.flag === true) {
                console.log("Result----", result);
                try {
                    const insert_users_sql = heredoc(function () {/*
                    INSERT INTO users (email) VALUES (:email)
                    */
                    });
                    const insertResult = await connection.query(insert_users_sql, {
                        type: sequelize.QueryTypes.INSERT,
                        replacements: {
                            email
                        }
                    });
                    console.log("Inserted new email into users table:", insertResult);
                    const userId = insertResult[0];
                    const communitySelectSql = heredoc(function () {/*
                    SELECT id FROM community
                    */
                    });
                    const communityIds = await connection.query(communitySelectSql, {
                        type: sequelize.QueryTypes.SELECT,
                    });
                    const communityInsertSql = heredoc(function () {/*
                    INSERT INTO joined_communities
                    (userId,communityId,status)
                    VALUES (:userId,:communityId,:status)
                    */
                    });
                    await Promise.all(communityIds.map(
                        async communityData => connection.query(communityInsertSql, {
                            type: sequelize.QueryTypes.INSERT,
                            replacements: {
                                userId: userId,
                                communityId: communityData.id,
                                status: communityData.id === communityId ? constants.userJoinStatus.ACCEPTED : constants.userJoinStatus.UNJOINED
                            }
                        })
                    ));
                    return res.json({
                        code: 200,
                        status: 'Success',
                        message: `Successfully invited new user ${email}`,
                        token: req.token
                    })
                } catch (e) {
                    console.log(e);
                    return res.json({
                        code: 500,
                        status: 'Fail',
                        message: e.message
                    })
                }
            } else {
                console.log("in-Failed");
                res.json({
                    "code": 500,
                    "status": "Fail",
                    "message": "Fail to send email",
                });
            }
        });
    },
};