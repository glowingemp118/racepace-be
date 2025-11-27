const express = require('express');
const router = express.Router();
const { getFAQs, saveFAQ, UpdateFAQ, DeleteFAQ } = require("../controllers/admin/FAQController");
const { getTAC, getPrivacy, getAbout, saveAbout, savePrivacy, saveTerms } = require('../controllers/admin/SettingsController');
const { allSupport, addSupport, supportReply } = require('../controllers/admin/supportController');
const { protect } = require('../middleware/authMiddleware');
const { adminApproved, registerAdmin, adminLogin } = require('../controllers/admin/adminController');

// router.use(protect);
router.post('/signup', registerAdmin).post('/login', adminLogin);
router.get('/faq' , getFAQs).
    post('/faq',protect,  saveFAQ).
    put('/faq',protect, UpdateFAQ).
    delete('/faq',protect, DeleteFAQ);
router.get('/tac',  getTAC).
    get('/privacy', getPrivacy).
    get('/about', getAbout).
    put('/about', protect, saveAbout).
    put('/privacy', protect,savePrivacy).
    put('/tac', protect, saveTerms).
    put('/approved/:id',protect, adminApproved);
router.get('/support', protect, allSupport);
router.post('/support', addSupport);
router.put('/support', protect, supportReply);

module.exports = router