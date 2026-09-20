const fs = require('fs');
const path = require('path');
const multer = require('multer');
const FileDoc = require('../models/File');
const Project = require('../models/Project');

const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadFile = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!projectId) {
      return res.status(400).json({ message: 'Project id is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const fileDoc = await FileDoc.create({
      name: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      size: req.file.size,
      project: projectId,
      uploadedBy: req.user._id
    });

    project.files.push(fileDoc._id);
    await project.save();

    return res.status(201).json(fileDoc);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProjectFiles = async (req, res) => {
  try {
    const files = await FileDoc.find({ project: req.params.projectId }).sort({ createdAt: -1 });
    return res.status(200).json(files);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { upload, uploadFile, getProjectFiles };
