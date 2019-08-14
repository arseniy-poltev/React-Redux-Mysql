const heredoc = require('heredoc');
let sequelize = require('sequelize');
let config = require('../config/database.js');
const ValidateService = require('../service/ValidatorService.js');
const CommonService = require('../service/CommonService.js');
const async = require('async');
const constants = require('../constants');
let connection = config.connection;

module.exports = {
    getUnjoinedCommunities: (req, res) => {
        let loginUser = req.user;
        var select_sql = heredoc(function () {/*
        SELECT community.*
        FROM (SELECT * FROM joined_communities WHERE userId=:userId AND status=:status) joins
        LEFT JOIN community ON joins.communityId=community.id
        */
        });
        connection.query(select_sql, {
            type: sequelize.QueryTypes.SELECT,
            replacements: {
                userId: loginUser.id,
                status: constants.userJoinStatus.UNJOINED
            }
        }).then(communities => {
            console.log("Community-Length", communities.filter(community => community.id).length);
            if (communities && communities.length > 0) {
                return res.json({
                    "code": 200,
                    "message": "Data Not Found",
                    "data": communities.filter(community => community.id),
                    "token": req.token
                });
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

    requestJoinToCommunity: async (req, res) => {
        let params = req.body;
        let loginUser = req.user;
        params.userId = loginUser.id;
        console.log("In----req", params);
        try {
            //check required field
            let isValid = ValidateService.checkCommonValidation(params);
            let reqValid = ValidateService.checkRequestJoinCommunityReqValidation(params);
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
                const {communityIds} = params;
                const updateSql = heredoc(function () {/*
                UPDATE joined_communities
                SET status=:joinStatus
                WHERE communityId=:communityId AND userId=:userId AND status=:unJoinStatus
                */
                });
                const updatedData = await Promise.all(communityIds.map(
                    async communityId => connection.query(updateSql, {
                        type: sequelize.QueryTypes.INSERT,
                        replacements: {
                            joinStatus: constants.userJoinStatus.REQUEST_JOIN,
                            unJoinStatus: constants.userJoinStatus.UNJOINED,
                            communityId: communityId,
                            userId: params.userId
                        }
                    })
                ));
                console.log("updatedData:===", updatedData);
                return res.json({
                    "code": 200,
                    "message": "Success",
                    "token": req.token
                });
            }
        } catch
            (e) {
            console.error(e);
            return res.json({
                "code": 500,
                "status": "Error",
                "message": e.message
            });
        }
    }
}
;