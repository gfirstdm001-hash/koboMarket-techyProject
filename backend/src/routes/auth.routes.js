const express = require('express');
const router = express.Router(); 
const {
    registerUser,
    verifyEmail,
    loginUser,
    refreshAccessToken,
    logoutUser,
    forgotPassword,
    resetPassword
} = require('../controllers/auth.controllers');

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;