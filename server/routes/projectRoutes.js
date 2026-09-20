const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  getPublicProject,
  addProjectMember,
  getProjectAnalytics,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createProject);
router.get('/', protect, getProjects);
router.get('/public/:id', getPublicProject);
router.get('/:id/analytics', protect, getProjectAnalytics);
router.post('/:id/members', protect, addProjectMember);
router.get('/:id', protect, getProjectById);
router.put('/:id', protect, updateProject);
router.patch('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;
