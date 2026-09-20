const express = require('express');
const { createNote, getProjectNotes } = require('../controllers/notesController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createNote);
router.get('/project/:projectId', protect, getProjectNotes);

module.exports = router;
