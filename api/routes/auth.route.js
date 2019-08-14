const AuthController = require('../controller/auth.js');
const express = require('express');
const router = express.Router();

//*****************************************************************
// *  User Auth                                                   *
// ****************************************************************
router.post('/login', AuthController.login);
router.post('/user-register', AuthController.create);
router.post('/forgot-password', AuthController.forgotPassword);
router.get('/forgot-password-change/:code', AuthController.forgotPasswordPage);
router.post('/update-password', AuthController.updatePassword);
router.get('/verify-user-account/:userToken', AuthController.verifyNewUser);
module.exports = router;
