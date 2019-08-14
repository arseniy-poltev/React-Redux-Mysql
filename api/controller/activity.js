let heredoc = require('heredoc');
let sequelize = require('sequelize');
let config = require('../config/database.js');
let multer = require('multer');
let mime = require('mime');
const ValidateService = require('../service/ValidatorService.js');
const CommonService = require('../service/CommonService.js');
const async = require('async');
const _ = require('lodash');
const randomStringGenerator = require("../service/CommonService").randomStringGenerator;
let storage = multer.diskStorage({
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
const constants = require('../constants');
let connection = config.connection;

module.exports = {
    /**
     * @desc : getting list of activity
     * as per login
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    paginate: async (req, res) => {
        let communityId = req.params.communityId;
        let loginUser = req.user;

        async.waterfall([
            //data for particular user
            function (wcb) {
                const select_sql = heredoc(function () {/*
                SELECT * FROM activity WHERE endDate>NOW() AND status=:status AND communityId=:communityId
                */
                });
                connection.query(select_sql, {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: {
                        communityId,
                        status: constants.activityStatus.ACTIVE
                    }
                }).then(activities => {
                    console.log("Activity-Length", activities.length);
                    if (activities && activities.length > 0) {
                        wcb(null, activities);
                    } else {
                        return res.json({
                            "code": 404,
                            "message": "Data Not Found",
                            "data": [],
                        });
                    }
                }).catch(e => {
                    return res.json({
                        "code": 400,
                        "message": "Error",
                        "data": e,
                    });
                });
            },

            async function (activities, wcb) {
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
                    "data": result,
                    "token": req.token
                });
            }
        ])
    },
    /**
     * @desc : getting list of myPosts and myAccepts
     * as per login
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getMyData: async (req, res) => {
        let {communityId} = req.params;
        let loginUser = req.user;

        async.waterfall([
            //data for particular user
            function (wcb) {
                const select_postData = heredoc(function () {/*
                 SELECT * FROM activity WHERE userId=:userId AND communityId=:communityId
                 */
                });
                const select_acceptData = heredoc(function () {/*
                 SELECT activity.*,users.firstName,users.lastName
                 FROM activity,(SELECT activityId FROM accept WHERE accept.userId=:userId) as accepts,users
                 WHERE accepts.activityId=activity.id AND activity.userId=users.id AND activity.communityId=:communityId
                 */
                });
                connection.query(select_postData, {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: {
                        userId: loginUser.id,
                        communityId
                    }
                }).then(myPostActivities => {
                    console.log("Activity-Length of myPosts", myPostActivities.length);
                    connection.query(select_acceptData, {
                        type: sequelize.QueryTypes.SELECT,
                        replacements: {
                            userId: loginUser.id,
                            communityId
                        }
                    }).then(myAcceptActivities => {
                        console.log("Activity-Length of myAccepts", myAcceptActivities.length);
                        wcb(null, myPostActivities, myAcceptActivities);
                    }).catch(e => {
                        return res.json({
                            "code": 400,
                            "message": "Error",
                            "data": e,
                        });
                    });
                }).catch(e => {
                    return res.json({
                        "code": 400,
                        "message": "Error",
                        "data": e,
                    });
                });
            },

            //data for admin and super admin
            async function (myPostActivities, myAcceptActivities, wcb) {
                const myPosts = await Promise.all(myPostActivities.map(async activity => {
                    var select_sql = heredoc(function () {/*
                    SELECT accept.*,users.firstName,users.lastName
                    FROM accept,users
                    WHERE activityId=:activityId AND accept.userId=users.id
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
                const myAccepts = await Promise.all(myAcceptActivities.map(async activity => {
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
                    "data": {myPosts, myAccepts},
                    "token": req.token
                });
            }
        ])
    },
    /**
     *
     * @param req
     * @param res
     */
    create: (req, res) => {
        let params = req.body;
        const file = req.files;
        let loginUser = req.user;
        params.userId = loginUser.id;
        console.log("In----req", params);
        try {
            //check required field
            let isValid = ValidateService.checkCommonValidation(params);
            let reqValid = ValidateService.checkActivityCreateReqValidation(params);
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
                    function (wcb) {
                        console.log("In--Create");
                        let fileData = [];
                        if (file) {
                            let fileId = String(Date.now());
                            // let imagePath = await CommonService.convertBase64Image(params.attachments);
                            // const imagePath = saveMultipartFile(attachments);
                            const extension = file.attachments.name.substring(file.attachments.name.lastIndexOf(".") + 1).toLowerCase();
                            const randomName = randomStringGenerator(25, '#aA');
                            const filePath = './files/' + randomName + "." + extension;
                            file.attachments.mv(filePath, err => {
                                if (err) {
                                    console.log("File is not saved. error: ", err);
                                    throw err;
                                } else {
                                    let url = req.protocol + "://" + req.headers.host + '/api/file' + filePath.substring(filePath.indexOf('files') + 5);
                                    console.log("File--Path", filePath);
                                    console.log("File--url", url);
                                    let attachmentUserId = loginUser && loginUser.id ? loginUser.id : null;
                                    let attachmentUserName = loginUser && loginUser.userName ? loginUser.userName : null;
                                    fileData.push({
                                        attachmentId: fileId,
                                        attachmentName: url,
                                        originalFileName: file.attachments.name,
                                        userId: attachmentUserId,
                                        userName: attachmentUserName
                                    });
                                    console.log("fileData--Array", fileData);
                                    wcb(null, fileData);
                                }
                            });
                        } else {
                            wcb(null, []);
                        }
                    },
                    function (fileData, wcb) {
                        let insertAttachArray = JSON.stringify(fileData);
                        var sql = heredoc(function () {/*
                        INSERT INTO activity
                        ( title,activityType,attachments,activityTag,
                         startDate,endDate,status, userId,
                         comments,amount,description,isEmergency,communityId)
                        VALUES (:title,:activityType,:attachments,
                        :activityTag,:startDate,:endDate,:status,
                        :userId,:comments,:amount,:description,
                        :isEmergency,:communityId);
                        */
                        });
                        const currDate = new Date();
                        currDate.setHours(currDate.getHours() + currDate.getTimezoneOffset() / 60);
                        const endDate = new Date();
                        params.duration ?
                            endDate.setDate(currDate.getDate() + Number(params.duration)) :
                            endDate.setDate(currDate.getDate() + 6);
                        connection.query(sql, {
                            type: sequelize.QueryTypes.INSERT,
                            replacements: {
                                title: params.title,
                                activityType: params.activityType,
                                attachments: insertAttachArray ? insertAttachArray : '[]',
                                activityTag: params.activityTag ? params.activityTag : constants.activityTagType.LOW,
                                startDate: params.startDate ? params.startDate : currDate,
                                endDate,
                                status: params.status === 'true'
                                    ? constants.activityStatus.ACTIVE
                                    : constants.activityStatus.DE_ACTIVE,
                                userId: params.userId ? params.userId : null,
                                comments: '[]',
                                amount: params.amount ? params.amount : 0,
                                description: params.description,
                                isEmergency: params.isEmergency === true || params.isEmergency === 'true'
                                    ? constants.emergencyType.EMERGENCY
                                    : constants.emergencyType.NO_EMERGENCY,
                                communityId: params.communityId
                            }
                        }).then(function (activities) {
                            console.log("activities:===", activities);
                            if (activities.length !== 0) {
                                let myNewId = activities[0];
                                console.log("My--Id", myNewId);

                                //getting saved data in all
                                CommonService.commonSaveActivityGetter(myNewId, function (err, activity, accepts) {
                                    if (err) {
                                        res.json({
                                            "code": 400,
                                            "data": {},
                                            "status": "Error",
                                            "message": "Failed"
                                        });
                                    } else if (activity && activity !== {}) {
                                        return res.json({
                                            "code": 200,
                                            "message": "success",
                                            "data": params.status === 'true' ? {
                                                ...activity,
                                                accepts
                                            } : {},
                                            "token": req.token
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
                                console.log("Errr-11111111", err);
                                return res.json({
                                    "code": 404,
                                    "message": "Failed",
                                    "data": {},
                                });
                            }
                        }).catch(function (err) {
                            if (err) throw err;
                        });
                    },
                ])
            }
        } catch
            (err) {
            console.log(err);
            return res.json({
                "code": 500,
                "message": err.message,
                "data": {},
            });
        }
    },
    /**
     * @desc get activity detail
     * @param req
     * @param res
     * @returns {Promise<*|Sequelize.json|Promise<any>>}
     */
    view: async (req, res) => {
        let params = req.params;
        console.log("In---Activity-Detail", params);
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
                            SELECT * FROM activity WHERE id=:id
                        */
                        });
                        connection.query(select_sql, {
                            type: sequelize.QueryTypes.SELECT,
                            replacements: {
                                id: params.id
                            }
                        }).then(activity => {
                                if (activity && activity.length === 0) {
                                    return res.json({
                                        "code": 404,
                                        "status": "Error",
                                        "message": "User not found"
                                    });
                                }
                                else {
                                    return res.json({
                                        "code": 200,
                                        "status": "Success",
                                        "message": "Success",
                                        "data": _.first(activity),
                                        "token": req.token
                                    });
                                }
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
     * @desc : update activity
     * @param req
     * @param res
     * @returns {Promise<*|Sequelize.json|Promise<any>>}
     */
    update: (req, res) => {
        let params = req.body;
        const file = req.files;
        let pathParams = req.params;
        let loginUser = req.user;
        params.userId = loginUser.id;
        console.log("In----req", params);
        console.log("In----Id", pathParams.activityId);
        try {
            //check required field
            let isValid = ValidateService.checkCommonValidation(params);
            let reqValid = ValidateService.checkCommonUpdateReqValidation(pathParams);
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
                    function (wcb) {
                        console.log("In--Create");
                        let fileData = [];
                        if (file) {
                            let fileId = String(Date.now());
                            // let imagePath = await CommonService.convertBase64Image(params.attachments);
                            // const imagePath = saveMultipartFile(attachments);
                            const extension = file.attachments.name.substring(file.attachments.name.lastIndexOf(".") + 1).toLowerCase();
                            const randomName = randomStringGenerator(25, '#aA');
                            const filePath = './files/' + randomName + "." + extension;
                            file.attachments.mv(filePath, err => {
                                if (err) {
                                    console.log("File is not saved. error: ", err);
                                    throw err;
                                } else {
                                    let url = req.protocol + "://" + req.headers.host + '/api/file' + filePath.substring(filePath.indexOf('files') + 5);
                                    console.log("File--Path", filePath);
                                    console.log("File--url", url);
                                    let attachmentUserId = loginUser && loginUser.id ? loginUser.id : null;
                                    let attachmentUserName = loginUser && loginUser.userName ? loginUser.userName : null;
                                    fileData.push({
                                        attachmentId: fileId,
                                        attachmentName: url,
                                        originalFileName: file.attachments.name,
                                        userId: attachmentUserId,
                                        userName: attachmentUserName
                                    });
                                    console.log("fileData--Array", fileData);
                                    wcb(null, fileData);
                                }
                            });
                        } else {
                            wcb(null, []);
                        }
                    },
                    function (fileData, wcb) {
                        console.log("In--Update");
                        let insertAttachArray = JSON.stringify(fileData);
                        const endDate = new Date();
                        endDate.setHours(endDate.getHours() + endDate.getTimezoneOffset() / 60);
                        endDate.setDate(endDate.getDate() + Number(params.duration));
                        var update_sql = fileData.length > 0 ? heredoc(function () {/*
                        UPDATE activity SET
                        title=:title,
                        description=:description,
                        endDate=:endDate,
                        status=:status,
                        attachments=:attachments,
                        amount=:amount
                        WHERE
                        id=:id;
                        */
                        }) : heredoc(function () {/*
                        UPDATE activity SET
                        title=:title,
                        description=:description,
                        endDate=:endDate,
                        status=:status,
                        amount=:amount
                        WHERE
                        id=:id;
                        */
                        });
                        connection.query(update_sql, {
                            type: sequelize.QueryTypes.UPDATE,
                            replacements: {
                                title: params.title,
                                description: params.description,
                                endDate: endDate,
                                status: params.status,
                                amount: params.amount,
                                attachments: insertAttachArray,
                                id: pathParams.activityId
                            }
                        }).then(function (activities) {
                            console.log("activities:===", activities);
                            if (activities.length !== 0) {
                                let myNewId = pathParams.activityId;
                                console.log("My--Id", myNewId);
                                //getting saved data in all
                                CommonService.commonSaveActivityGetter(myNewId, function (err, activity, accepts) {
                                    if (err) {
                                        res.json({
                                            "code": 400,
                                            "data": {},
                                            "status": "Error",
                                            "message": "Failed"
                                        });
                                    } else if (activity && activity !== {}) {
                                        console.log("In--Result");
                                        res.json({
                                            "code": 200,
                                            "data": {
                                                ...activity,
                                                accepts
                                            },
                                            "status": "Success",
                                            "message": "Updated Successfully",
                                            "token": req.token
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
                                console.log("Errr-11111111", err);
                                return res.json({
                                    "code": 404,
                                    "message": "Failed",
                                    "data": {},
                                });
                            }
                        }).catch(function (err) {
                            if (err) throw err;
                        });
                    },
                ])
            }
        } catch (err) {
            throw(err);
        }
    },

    /**
     * @desc : create attachments
     * @param req
     * @param res
     * @returns {Promise<*|Sequelize.json|Promise<any>>}
     */
    addAttachments: (req, res) => {
        let params = req.body;
        let loginUser = req.user;
        console.log("In----req-attach", params);
        try {
            //check required field
            let isValid = ValidateService.checkCommonValidation(params);
            let reqValid = ValidateService.checkActivityAttachmentReqValidation(params);
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
                    function (wcb) {
                        console.log("In--Check");
                        var select_sql = heredoc(function () {/*
                        SELECT * FROM activity WHERE id=:id
                        */
                        });
                        connection.query(select_sql, {
                            type: sequelize.QueryTypes.SELECT,
                            replacements: {
                                id: params.id
                            }
                        }).then(function (activities) {
                            if (activities && activities.length > 0) {
                                let activity = _.first(activities);
                                let dataArray = JSON.parse(activity.attachments);
                                let imageId = String(Date.now());
                                let imagePath = CommonService.convertBase64Image(params.attachment);
                                let imageName = req.protocol + "://" + req.headers.host + imagePath.split('./files')[1];
                                let attachmentUserId = loginUser && loginUser.id ? loginUser.id : null;
                                let attachmentUserName = loginUser && loginUser.userName ? loginUser.userName : null;
                                dataArray.push({
                                    userId: attachmentUserId,
                                    userName: attachmentUserName,
                                    attachmentId: imageId,
                                    attachmentName: imageName,
                                });
                                console.log("In--Check--Activities------2222", JSON.stringify(dataArray));
                                let updateImageArray = JSON.stringify(dataArray);
                                let update_sql = heredoc(function () {/*
                                    UPDATE activity SET
                                    attachments=:attachments
                                    WHERE id=:id
                                    */
                                });

                                connection.query(update_sql, {
                                    type: sequelize.QueryTypes.UPDATE,
                                    replacements: {
                                        attachments: updateImageArray,
                                        id: params.id
                                    }
                                }).then(function (userComments) {
                                    if (userComments && userComments.length !== 0) {
                                        let myNewId = params.id;
                                        console.log("My--Id", myNewId);

                                        //getting saved data in all
                                        CommonService.commonSaveActivityGetter(myNewId, function (err, activity, accepts) {
                                            if (err) {
                                                res.json({
                                                    "code": 400,
                                                    "data": {},
                                                    "status": "Error",
                                                    "message": "Failed"
                                                });
                                            } else if (activity && activity !== {}) {
                                                console.log("In--Result");
                                                res.json({
                                                    "code": 200,
                                                    "data": {
                                                        ...activity,
                                                        accepts
                                                    },
                                                    "status": "Success",
                                                    "message": "Success",
                                                    "token": req.token
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

                                    }
                                }).catch((err) => {
                                    console.log("Errr", err);
                                    return res.json({
                                        "code": 400,
                                        "message": "Error",
                                        "data": err,
                                    });
                                });
                            } else {
                                return res.json({
                                    "code": 404,
                                    "status": "Error",
                                    "message": "Activity not found"
                                });
                            }
                        }).catch(function (err) {
                            if (err) throw err;
                        });
                    },
                ])
            }
        } catch (err) {
            throw(err);
        }
    },

    /**
     * @desc : create comments
     * @param req
     * @param res
     * @returns {Promise<*|Sequelize.json|Promise<any>>}
     */
    addComments:
        (req, res) => {
            let params = req.body;
            let loginUser = req.user;
            console.log("In----req-attach", params);
            try {
                //check required field
                let isValid = ValidateService.checkCommonValidation(params);
                let reqValid = ValidateService.checkActivityCommentReqValidation(params);
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
                        function (wcb) {
                            console.log("In--Check");
                            var select_sql = heredoc(function () {/*
                        SELECT * FROM activity WHERE id=:id
                        */
                            });
                            connection.query(select_sql, {
                                type: sequelize.QueryTypes.SELECT,
                                replacements: {
                                    id: params.id
                                }
                            }).then(function (activities) {
                                if (activities && activities.length > 0) {
                                    let activity = _.first(activities);
                                    let dataArray = JSON.parse(activity.comments);
                                    dataArray.push({
                                        userId: loginUser && loginUser.id ? loginUser.id : null,
                                        userName: loginUser && loginUser.userName ? loginUser.userName : null,
                                        comment: params.comment
                                    });
                                    console.log("In--Check--Activities------2222", JSON.stringify(dataArray));
                                    let updateImageArray = JSON.stringify(dataArray);
                                    let update_sql = heredoc(function () {/*
                                      UPDATE activity SET
                                        comments=:comments
                                         WHERE id=:id
                                    */
                                    });

                                    connection.query(update_sql, {
                                        type: sequelize.QueryTypes.UPDATE,
                                        replacements: {
                                            comments: updateImageArray,
                                            id: params.id
                                        }
                                    }).then(function (userComments) {
                                        if (userComments && userComments.length !== 0) {
                                            let myNewId = params.id;
                                            console.log("My--Id", myNewId);
                                            //getting saved data in all
                                            CommonService.commonSaveActivityGetter(myNewId, function (err, activity, accepts) {
                                                if (err) {
                                                    res.json({
                                                        "code": 400,
                                                        "data": {},
                                                        "status": "Error",
                                                        "message": "Failed"
                                                    });
                                                } else if (activity && activity !== {}) {
                                                    console.log("In--Result");
                                                    res.json({
                                                        "code": 200,
                                                        "data": {
                                                            ...activity,
                                                            accepts
                                                        },
                                                        "status": "Success",
                                                        "message": "Success",
                                                        "token": req.token
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
                                        }
                                    }).catch((err) => {
                                        console.log("Errr", err);
                                        return res.json({
                                            "code": 400,
                                            "message": "Error",
                                            "data": err,
                                        });
                                    });
                                } else {
                                    return res.json({
                                        "code": 404,
                                        "status": "Error",
                                        "message": "Activity not found"
                                    });
                                }
                            }).catch(function (err) {
                                if (err) throw err;
                            });
                        },
                    ])
                }
            } catch (err) {
                throw(err);
            }
        },
    accept: (req, res) => {
        let params = req.body;
        const file = req.files;
        let loginUser = req.user;
        params.userId = loginUser.id;
        console.log("In----req--accept", params);
        try {
            //check required field
            let isValid = ValidateService.checkCommonValidation(params);
            let reqValid = ValidateService.checkActivityAcceptReqValidation(params);
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
                    function (wcb) {
                        console.log("In--Accept");
                        let fileData = [];
                        if (file) {
                            let fileId = String(Date.now());
                            // let imagePath = await CommonService.convertBase64Image(params.attachments);
                            // const imagePath = saveMultipartFile(attachments);
                            const extension = file.attachments.name.substring(file.attachments.name.lastIndexOf(".") + 1).toLowerCase();
                            const randomName = randomStringGenerator(25, '#aA');
                            const filePath = './files/' + randomName + "." + extension;
                            file.attachments.mv(filePath, err => {
                                if (err) {
                                    console.log("File is not saved. error: ", err);
                                    throw err;
                                } else {
                                    let url = req.protocol + "://" + req.headers.host + '/api/file' + filePath.substring(filePath.indexOf('files') + 5);
                                    console.log("File--Path", filePath);
                                    console.log("File--url", url);
                                    let attachmentUserId = loginUser && loginUser.id ? loginUser.id : null;
                                    let attachmentUserName = loginUser && loginUser.userName ? loginUser.userName : null;
                                    fileData.push({
                                        attachmentId: fileId,
                                        attachmentName: url,
                                        originalFileName: file.attachments.name,
                                        userId: attachmentUserId,
                                        userName: attachmentUserName
                                    });
                                    console.log("fileData--Array", fileData);
                                    wcb(null, fileData);
                                }
                            });
                        } else {
                            wcb(null, []);
                        }
                    }, function (fileData, wcb) {
                        let insertAttachArray = JSON.stringify(fileData);
                        var sql = heredoc(function () {/*
                        INSERT INTO accept
                        ( userId,activityId,dateTime,description,deadline,amount,attachments)
                        VALUES (:userId,:activityId,:dateTime,:description,:deadline,:amount,:attachments);
                        */
                        });
                        const currDate = new Date();
                        currDate.setHours(currDate.getHours() + currDate.getTimezoneOffset() / 60);
                        const endDate = new Date();
                        endDate.setDate(currDate.getDate() + Number(params.duration));
                        connection.query(sql, {
                            type: sequelize.QueryTypes.INSERT,
                            replacements: {
                                userId: params.userId ? params.userId : null,
                                activityId: params.activityId ? params.activityId : null,
                                dateTime: currDate,
                                description: params.description,
                                deadline: endDate,
                                amount: params.amount ? params.amount : 0,
                                attachments: insertAttachArray,
                            }
                        }).then(function (accepts) {
                            console.log("activities:===", accepts);
                            if (accepts.length !== 0) {
                                //getting saved data in all
                                CommonService.commonSaveActivityGetter(params.activityId, function (err, activity, accepts) {
                                    if (err) {
                                        res.json({
                                            "code": 400,
                                            "data": {},
                                            "status": "Error",
                                            "message": "Failed"
                                        });
                                    } else if (activity && activity !== {}) {
                                        return res.json({
                                            "code": 200,
                                            "message": "success",
                                            "data": {
                                                ...activity,
                                                accepts
                                            },
                                            "token": req.token
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
                                console.log("Errr-11111111", err);
                                return res.json({
                                    "code": 404,
                                    "message": "Failed",
                                    "data": {},
                                });
                            }
                        }).catch(function (err) {
                            if (err) throw err;
                        });
                    },
                ])
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}
;