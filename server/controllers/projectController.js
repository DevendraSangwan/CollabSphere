const crypto = require('crypto');
const Project = require('../models/Project');
const Note = require('../models/Note');
const FileDoc = require('../models/File');
const User = require('../models/User');

const createProject = async (req, res) => {
  try {
    const { title, description, isPublic, tags, memberEmails } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Project title is required' });
    }

    const rawEmails = Array.isArray(memberEmails)
      ? memberEmails
      : typeof memberEmails === 'string'
        ? memberEmails.split(',').map((email) => email.trim()).filter(Boolean)
        : [];

    const invitedUsers = await User.find({ email: { $in: rawEmails } }).select('_id email');
    const memberIds = [...new Set([req.user._id.toString(), ...invitedUsers.map((user) => user._id.toString())])];

    const project = await Project.create({
      title,
      description: description || '',
      owner: req.user._id,
      members: memberIds,
      isPublic: Boolean(isPublic),
      shareToken: crypto.randomBytes(10).toString('hex'),
      tags: Array.isArray(tags) ? tags : [],
    });

    await User.updateMany(
      { _id: { $in: memberIds.filter((id) => id !== req.user._id.toString()) } },
      { $addToSet: { projects: project._id } }
    );

    return res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }, { isPublic: true }]
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPublicProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project || !project.isPublic) {
      return res.status(404).json({ message: 'Project not found or not public' });
    }

    const [notes, files] = await Promise.all([
      Note.find({ project: project._id }).sort({ createdAt: -1 }),
      FileDoc.find({ project: project._id }).sort({ createdAt: -1 })
    ]);

    return res.status(200).json({ project, notes, files });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addProjectMember = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Member email is required' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can add members' });
    }

    const member = await User.findOne({ email: email.toLowerCase().trim() });
    if (!member) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    if (project.members.some((id) => id.toString() === member._id.toString())) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    project.members.push(member._id);
    await project.save();
    member.projects.addToSet(project._id);
    await member.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    return res.status(200).json({ message: 'Member added successfully', project: updatedProject });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProjectAnalytics = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const [notesCount, files, totalSize] = await Promise.all([
      Note.countDocuments({ project: project._id }),
      FileDoc.find({ project: project._id }),
      FileDoc.aggregate([
        { $match: { project: project._id } },
        { $group: { _id: null, totalSize: { $sum: '$size' } } }
      ])
    ]);

    const shareUrl = project.isPublic ? `${req.protocol}://${req.get('host')}/public/${project._id}` : null;

    return res.status(200).json({
      analytics: {
        members: project.members.length,
        notes: notesCount,
        files: files.length,
        totalSize: totalSize[0]?.totalSize || 0,
        public: project.isPublic,
        shareUrl
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not allowed to update this project' });
    }

    if (req.body.isPublic && !project.shareToken) {
      req.body.shareToken = crypto.randomBytes(10).toString('hex');
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    return res.status(200).json(updatedProject);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not allowed to delete this project' });
    }

    await Note.deleteMany({ project: project._id });
    await FileDoc.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  getPublicProject,
  addProjectMember,
  getProjectAnalytics,
  updateProject,
  deleteProject
};
