const express = require('express');
const router = express.Router();
const { uploadFileApi, deleteFile } = require('../controllers/fileHandlingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/upload', uploadFileApi);
router.delete('/remove/:fileId', protect, deleteFile)

module.exports = router
