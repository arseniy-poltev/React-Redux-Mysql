const router = require('express').Router();
const AdminController = require("../controller/admin");
const verifyAdmin = require('../middleware/verifyAdmin');

router.get('/allInfo/:communityId', verifyAdmin, AdminController.allCommunityInfo);
//*****************************************************************
// *  User Management                                             *
// ****************************************************************
router.post('/approveUsers', verifyAdmin, AdminController.approveUsers);
router.post('/removeUsers', verifyAdmin, AdminController.removeUsers);
router.get('/allUsersToInvite/:communityId', verifyAdmin, AdminController.allUsersToInvite);
router.post('/addNewUsers', verifyAdmin, AdminController.addNewUsers);
router.get('/allUsersInWebsite/:communityId', verifyAdmin, AdminController.getAllUsersInWebsite);
router.post('/inviteNewUser', verifyAdmin, AdminController.insertNewEmail);
//*****************************************************************
// *  Activity Management                                         *
// ****************************************************************
router.post('/removeCards', verifyAdmin, AdminController.removeCards);
module.exports = router;