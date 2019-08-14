const router = require('express').Router();
const AuthController = require("../controller/auth");
const ActivityController = require("../controller/activity");
const CommunityController = require("../controller/community");
//*****************************************************************
// *  User Profile                                               *
// ****************************************************************
// router.get('/user-profile/:id', AuthController.profile);

//*****************************************************************
// *  Community Management                                        *
// ****************************************************************
router.get('/community-unjoined', CommunityController.getUnjoinedCommunities);
router.post('/community-request-join',CommunityController.requestJoinToCommunity);

//*****************************************************************
// *  Activity                                                    *
// ****************************************************************
router.get('/activity-paginate/:communityId', ActivityController.paginate);
router.get('/activity-my-data/:communityId', ActivityController.getMyData);
router.post('/activity-create', ActivityController.create);
// router.get('/activity-detail/:id', ActivityController.view);
router.put('/activity-update/:activityId', ActivityController.update);
// router.post('/activity-add-attachments', ActivityController.addAttachments);
router.post('/activity-add-comments', ActivityController.addComments);
router.post('/activity-accept', ActivityController.accept);

module.exports = router;