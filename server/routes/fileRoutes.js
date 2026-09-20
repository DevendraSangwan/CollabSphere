const express = require('express');
const { upload, uploadFile, getProjectFiles } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/project/:projectId', protect, getProjectFiles);

module.exports = router;
