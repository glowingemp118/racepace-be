const express = require('express');
const router = express.Router();
const { registerUser, loginUser, changePassword, logout, forgotpassword, validatepin, resetpassword, updateTimeZone, getUserProfile, updateUserProfile, updateUser, deleteUser, getAllUsers, getUserById, social_login, guest_login } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { grantAccess, types: { admin } } = require('../middleware/accessMiddleware');


router
    .post('/signup', registerUser)
    .post('/login', loginUser)
    .post('/guest', guest_login)
    .post('/social', social_login)
    .put('/changepassword', protect, changePassword)
    .post('/logout', protect, logout)
    .get('/me', protect, getUserProfile)
    .put('/forgotpassword', forgotpassword)
    .put('/validatepin', validatepin)
    .put('/profileUpdate', protect, updateUserProfile)
    .put('/userUpdate/:id', protect, grantAccess([admin]), updateUser)
    .put('/resetpassword', resetpassword)
    .put('/timezone', protect, updateTimeZone)
    .delete('/deleteUser', protect, deleteUser)
    .get('/all', protect, getAllUsers)
    .get('/single/:id', protect, getUserById)

module.exports = router