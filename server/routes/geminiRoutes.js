const express = require('express');
const { explainCode, generateProjectDocumentation } = require('../controllers/geminiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/explain', protect, explainCode);
router.post('/document', protect, generateProjectDocumentation);

module.exports = router;
