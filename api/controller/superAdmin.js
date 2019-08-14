let heredoc = require('heredoc');
let sequelize = require('sequelize');
let config = require('../config/database.js');
const ValidateService = require('../service/ValidatorService.js');
const async = require('async');
const constants = require('../constants');
const NotificationService = require("../service/NotificationService");
let connection = config.connection;

module.exports = {
    getAllUsers: async function (req, res) {
        const select_users_sql = heredoc(function () {/*
        SELECT users.id,users.firstName,users.lastName,users.userName,users.email
        FROM users WHERE verified=:verified
        AND id IN (SELECT userId FROM joined_communities WHERE joined_communities.role!=:roleSuperAdmin)
        */
        });
        try {
            const users = await connection.query(select_users_sql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    roleSuperAdmin: constants.userType.SUPER_ADMIN,
                    verified: constants.verifiedUserType.VERIFIED
                }
            });
            if (users.filter(user => user.id).length > 0) {
                return res.json({
                    code: 200,
                    message: 'Success',
                    data: users.filter(user => user.id),
                    "token": req.token
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
    allCommunities: function (req, res) {
        async.waterfall([
            function (wcb) {
                const select_sql = heredoc(function () {/*
                SELECT * FROM community
                */
                });
                connection.query(select_sql, {
                    type: sequelize.QueryTypes.SELECT
                }).then(allCommunities => {
                    console.log("allCommunities-Length", allCommunities.length);
                    wcb(null, allCommunities);
                }).catch(error => {
                    console.log(error);
                    return res.json({
                        "code": 500,
                        "message": error.message,
                        "status": 'Fail',
                    })
                })
            },
            async function (allCommunities, wcb) {
                const select_admins_sql = heredoc(function () {/*
                SELECT users.id,users.userName,users.firstName,users.lastName,users.email
                FROM (SELECT * FROM joined_communities
                WHERE communityId=:communityId AND status=:statusAccepted AND role=:adminRole) adminJoins
                LEFT JOIN users ON adminJoins.userId=users.id
                */
                });
                const select_numUsers_sql = heredoc(function () {/*
                SELECT COUNT(*) AS numUsers
                FROM (SELECT * FROM joined_communities
                WHERE communityId=:communityId AND status=:statusAccepted AND role!=:superAdminRole) allJoins
                LEFT JOIN users ON allJoins.userId=users.id
                */
                });
                const select_numPosts_sql = heredoc(function () {/*
                SELECT COUNT(*) AS numPosts FROM activity WHERE communityId=:communityId
                */
                });
                const select_numActivePosts_sql = heredoc(function () {/*
                SELECT COUNT(*) AS numActivePosts FROM activity WHERE communityId=:communityId AND status=:activeStatus
                */
                });
                try {
                    const allCommunityInfo = await Promise.all(allCommunities.map(async community => {
                        const admins = await connection.query(select_admins_sql, {
                            type: sequelize.QueryTypes.SELECT,
                            replacements: {
                                communityId: community.id,
                                adminRole: constants.userType.ADMIN,
                                statusAccepted: constants.userJoinStatus.ACCEPTED,
                            }
                        });
                        const countUsersResult = await connection.query(select_numUsers_sql, {
                            type: sequelize.QueryTypes.SELECT,
                            replacements: {
                                communityId: community.id,
                                superAdminRole: constants.userType.SUPER_ADMIN,
                                statusAccepted: constants.userJoinStatus.ACCEPTED,
                            }
                        });
                        const countPostsResult = await connection.query(select_numPosts_sql, {
                            type: sequelize.QueryTypes.SELECT,
                            replacements: {
                                communityId: community.id,
                            }
                        });
                        const countActivePostsResult = await connection.query(select_numActivePosts_sql, {
                            type: sequelize.QueryTypes.SELECT,
                            replacements: {
                                communityId: community.id,
                                activeStatus: constants.activityStatus.ACTIVE
                            }
                        });
                        return {
                            ...community,
                            admins,
                            numUsers: countUsersResult[0].numUsers,
                            numPosts: countPostsResult[0].numPosts,
                            numActivePosts: countActivePostsResult[0].numActivePosts,
                        }
                    }));
                    console.log("All Community Info---Length: ", allCommunityInfo.length);
                    if (allCommunityInfo.length > 0) {
                        return res.json({
                            "code": 200,
                            "message": 'Success',
                            'data': allCommunityInfo,
                            "token": req.token
                        })
                    } else {
                        return res.json({
                            "code": 200,
                            "message": 'Not Found Community',
                            "status": 'Fail',
                            "token": req.token
                        })
                    }
                } catch (e) {
                    console.log(e);
                    return res.json({
                        "code": 500,
                        "message": e.message,
                        "status": 'Fail',
                    })
                }
            },
        ]);
    },
    addCommunities: async function (req, res) {
        let isValid = ValidateService.checkCommonValidation(req.body);
        let reqValid = ValidateService.checkAddCommunityReqValidation(req.body);
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
        }
        const {name} = req.body;
        const selectSameCommunity = heredoc(function () {/*
        SELECT * FROM community WHERE id=:id
        */
        });
        const selectSameCommunityByName = heredoc(function () {/*
        SELECT * FROM community WHERE name=:name
        */
        });
        const insert_community_sql = heredoc(function () {/*
        INSERT INTO community (name) VALUES (:name)
        */
        });
        const select_users_sql = heredoc(function () {/*
        SELECT id FROM users
        */
        });
        const insert_users_sql = heredoc(function () {/*
        INSERT INTO joined_communities (userId,communityId) VALUES (:userId,:communityId)
        */
        });
        const update_superAdmin_sql = heredoc(function () {/*
        UPDATE joined_communities SET role=:superAdminRole, status=:statusAccepted WHERE userId=:superAdminId AND communityId=:communityId
        */
        });
        try {
            const selectResult = await connection.query(selectSameCommunityByName, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    name,
                }
            });
            if (selectResult.length > 0) {
                return res.json({
                    "code": 400,
                    "status": "Error",
                    "message": "The Community Name Already Exists"
                })
            }
            const [insertCommunityResult, users] = await Promise.all([
                connection.query(insert_community_sql, {
                    type: sequelize.QueryTypes.INSERT,
                    replacements: {
                        name,
                    }
                }),
                connection.query(select_users_sql, {
                    type: sequelize.QueryTypes.SELECT,
                })
            ]);
            console.log(`Inserted community: `, insertCommunityResult);
            console.log(`users: `, users);

            const insertUserResults = await Promise.all(users.map(async user => connection.query(insert_users_sql, {
                    type: sequelize.QueryTypes.INSERT,
                    replacements: {
                        userId: user.id,
                        communityId: insertCommunityResult[0]
                    }
                }))
            );
            const [newCommunity] = await Promise.all([
                connection.query(selectSameCommunity, {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: {
                        id: insertCommunityResult[0]
                    }
                }),
                connection.query(update_superAdmin_sql, {
                    type: sequelize.QueryTypes.UPDATE,
                    replacements: {
                        communityId: insertCommunityResult[0],
                        superAdminId: req.user.id,
                        superAdminRole: constants.userType.SUPER_ADMIN,
                        statusAccepted: constants.userJoinStatus.ACCEPTED
                    }
                })
            ]);
            return res.json({
                code: 200,
                status: 'Success',
                data: {
                    ...{
                        ...newCommunity[0],
                        role: constants.userType.SUPER_ADMIN
                    },
                    admins: [],
                    numUsers: 0,
                    numPosts: 0,
                    numActivePosts: 0
                },
                "token": req.token
            })
        } catch (e) {
            console.log(e);
            return res.json({
                code: 500,
                status: 'Fail',
                message: e.message
            })
        }
    },
    addAdmin: async function (req, res) {
        let isValid = ValidateService.checkCommonValidation(req.body);
        let reqValid = ValidateService.checkAddAdminReqValidation(req.body);
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
        }
        const {communityId, adminId} = req.body;

        const update_sql = heredoc(function () {/*
        UPDATE joined_communities SET role=:adminRole,status=:acceptedStatus
        WHERE communityId=:communityId AND role=:userRole AND userId=:adminId
        */
        });
        return await addAndRemoveAdmins(req, res, update_sql, communityId, adminId);
    },
    removeCommunities: async function (req, res) {
        let isValid = ValidateService.checkCommonValidation(req.body);
        let reqValid = ValidateService.checkRemoveCommunityReqValidation(req.body);
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
        }
        const {communityIds} = req.body;
        const delete_community_sql = heredoc(function () {/*
        DELETE FROM community WHERE id=:communityId
        */
        });
        const delete_joins_sql = heredoc(function () {/*
        DELETE FROM joined_communities WHERE communityId=:communityId
        */
        });
        try {
            const deleteCommunitiesResult = await Promise.all(communityIds.map(async communityId => connection.query(delete_community_sql, {
                type: sequelize.QueryTypes.DELETE,
                replacements: {
                    communityId,
                }
            })));
            const deleteJoinsResult = await Promise.all(communityIds.map(async communityId => connection.query(delete_joins_sql, {
                type: sequelize.QueryTypes.DELETE,
                replacements: {
                    communityId,
                }
            })));
            console.log(`Deleted communities: `, deleteCommunitiesResult);
            console.log(`Deleted joined_communities: `, deleteJoinsResult);
            return res.json({
                code: 200,
                status: 'Success',
                message: 'Success',
                "token": req.token
            })
        } catch (e) {
            console.log(e);
            return res.json({
                code: 500,
                status: 'Fail',
                message: e.message
            })
        }
    },
    removeAdmin: async function (req, res) {
        let isValid = ValidateService.checkCommonValidation(req.body);
        let reqValid = ValidateService.checkRemoveAdminReqValidation(req.body);
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
        }
        const {communityId, adminId} = req.body;
        const update_sql = heredoc(function () {/*
        UPDATE joined_communities SET role=:userRole,status=:acceptedStatus
        WHERE communityId=:communityId AND role=:adminRole AND userId=:adminId
        */
        });
        return await addAndRemoveAdmins(req, res, update_sql, communityId, adminId);
    },
    assignNewSuperAdmin: async function (req, res) {
        const userId = req.user.id;
        const update_sql = heredoc(function () {/*
        UPDATE joined_communities SET role=:superAdminRole,status=:acceptedStatus
        WHERE userId=:userId
        */
        });
        try {
            const updateResult = await connection.query(update_sql, {
                type: sequelize.QueryTypes.UPDATE,
                replacements: {
                    superAdminRole: constants.userType.SUPER_ADMIN,
                    acceptedStatus: constants.userJoinStatus.ACCEPTED,
                    userId,
                }
            });
            console.log("Update result: ", updateResult);
            return res.json({
                ...req.user,
                token: req.token
            });
        } catch (e) {
            return res.json({
                code: 500,
                status: 'Fail',
                message: e.message
            })
        }
    },
};

const addAndRemoveAdmins = async (req, res, update_sql, communityId, adminId) => {
    const select_user_sql = heredoc(function () {/*
    SELECT * FROM users WHERE id=:adminId
    */
    });
    const select_community_sql = heredoc(function () {/*
    SELECT * FROM community WHERE id=:communityId
    */
    });
    const admin = await connection.query(select_user_sql, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
            adminId,
        }
    });
    const community = await connection.query(select_community_sql, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
            communityId,
        }
    });
    let fullUrl = req.get('origin');
    const user = {};
    user.email = admin[0].email;
    user.subject = "Community Permission";
    user.successMsg = `Successfully sent emails to notify admin role were changed to the following emails ${user.email}`;
    user.mailMsg = `Your role in our community "${community[0].name}" was changed by super admin.\n Please login to our AngelHost ${fullUrl}`; // plaintext body

    NotificationService.emailNotification(user, async function (err, result) {
        if (err) {
            res.json({
                "code": 400,
                "data": {},
                "status": "failed",
                "message": "failed"
            });
        } else if (result && result.flag === true) {
            try {
                const updateResult = await connection.query(update_sql, {
                    type: sequelize.QueryTypes.UPDATE,
                    replacements: {
                        communityId,
                        userRole: constants.userType.USER,
                        adminRole: constants.userType.ADMIN,
                        adminId,
                        acceptedStatus: constants.userJoinStatus.ACCEPTED
                    }
                });
                console.log(`Updated admin roles: `, updateResult);
                return res.json({
                    code: 200,
                    status: 'Success',
                    message: result.message,
                    "token": req.token
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
            return res.json({
                "code": 500,
                "status": "Fail",
                "message": "Fail to send email"
            });
        }
    });
};