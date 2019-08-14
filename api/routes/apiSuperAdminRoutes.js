const router = require('express').Router();
const SuperAdminController = require("../controller/superAdmin");
const verifySuperAdmin = require('../middleware/verifySuperAdmin');

router.get('/assignNew', SuperAdminController.assignNewSuperAdmin);
router.get('/users', verifySuperAdmin, SuperAdminController.getAllUsers);
router.get('/all', verifySuperAdmin, SuperAdminController.allCommunities);
router.post('/community-add', verifySuperAdmin, SuperAdminController.addCommunities);
router.post('/admin-add', verifySuperAdmin, SuperAdminController.addAdmin);
router.post('/community-remove', verifySuperAdmin, SuperAdminController.removeCommunities);
router.post('/admin-remove', verifySuperAdmin, SuperAdminController.removeAdmin);
module.exports = router;