module.exports = {
    checkCommonValidation: (params) => {
        return !(JSON.stringify(params) === '{}' || params === undefined || params === null);
    },
    checkLoginReqValidation: (params) => {
        return !(!params.email || !params.password);
    },
    checkForgotReqValidation: (params) => {
        return params.email;
    },
    checkCreateReqValidation: (params) => {
        return !(!params.firstName || !params.lastName || !params.email || !params.password);
    },
    checkUpdateReqValidation: (params) => {
        return params.id;
    },
    checkBlockCreateReqValidation: (params) => {
        return params.title;
    },
    checkCommonUpdateReqValidation: (params) => {
        return params.activityId;
    },
    checkActivityCreateReqValidation: (params) => {
        return !(!params.activityType || !params.title || !params.communityId);
    },
    checkActivityCommentReqValidation: (params) => {
        return !(!params.id || !params.comment);
    },
    checkActivityAttachmentReqValidation: (params) => {
        return !(!params.id || !params.attachment);
    },
    checkActivityAcceptReqValidation: (params) => {
        return !(!params.activityId || !params.userId);
    },
    checkRequestJoinCommunityReqValidation: (params) => {
        return !(!params.communityIds || !params.communityIds.length || !params.userId);
    },
    checkAddCommunityReqValidation: (params) => {
        return !(!params.name);
    },
    checkRemoveCommunityReqValidation: (params) => {
        return !(!params.communityIds || !params.communityIds.length);
    },
    checkAddAdminReqValidation: (params) => {
        return !(!params.communityId || !params.adminId);
    },
    checkRemoveAdminReqValidation: (params) => {
        return !(!params.communityId || !params.adminId);
    },
};
