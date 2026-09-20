const Note = require('../models/Note');
const Project = require('../models/Project');

const createNote = async (req, res) => {
  try {
    const { title, content, projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ message: 'Project id is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const note = await Note.create({
      title: title || 'Untitled note',
      content: content || '',
      project: projectId,
      createdBy: req.user._id
    });

    project.notes.push(note._id);
    await project.save();

    return res.status(201).json(note);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProjectNotes = async (req, res) => {
  try {
    const notes = await Note.find({ project: req.params.projectId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createNote, getProjectNotes };
