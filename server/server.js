const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const notesRoutes = require('./routes/notesRoutes');
const fileRoutes = require('./routes/fileRoutes');
const geminiRoutes = require('./routes/geminiRoutes');
const Project = require('./models/Project');
const Note = require('./models/Note');
const FileDoc = require('./models/File');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CollabSphere API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/ai', geminiRoutes);

app.get('/public/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project || !project.isPublic) {
      return res.status(404).send('<h1>Project not found or not public</h1>');
    }

    const notes = await Note.find({ project: project._id }).sort({ createdAt: -1 });
    const files = await FileDoc.find({ project: project._id }).sort({ createdAt: -1 });

    const notesHtml = notes.length
      ? notes.map((note) => `<div class="card"><h3>${escapeHtml(note.title)}</h3><pre>${escapeHtml(note.content || '')}</pre></div>`).join('')
      : '<p>No notes yet.</p>';

    const filesHtml = files.length
      ? files.map((file) => `<li><a href="${file.path}" target="_blank" rel="noreferrer">${escapeHtml(file.originalName)}</a> (${file.mimeType})</li>`).join('')
      : '<p>No files uploaded yet.</p>';

    const html = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(project.title)} | CollabSphere</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #0b1220; color: #edf3ff; }
          .container { max-width: 1000px; margin: 0 auto; }
          .card { background: #111b2d; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 18px; margin-bottom: 20px; }
          a { color: #5eead4; }
          pre { white-space: pre-wrap; word-break: break-word; background: rgba(255,255,255,0.02); padding: 14px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${escapeHtml(project.title)}</h1>
          <p>${escapeHtml(project.description || 'No description')}</p>
          <p>Owner: ${escapeHtml(project.owner?.name || 'Unknown')}</p>
          <div class="card">
            <h2>Members</h2>
            <ul>${project.members.map((member) => `<li>${escapeHtml(member.name)}</li>`).join('')}</ul>
          </div>
          <div class="card">
            <h2>Notes</h2>
            ${notesHtml}
          </div>
          <div class="card">
            <h2>Files</h2>
            <ul>${filesHtml}</ul>
          </div>
        </div>
      </body>
      </html>`;

    res.send(html);
  } catch (error) {
    console.error(error);
    return res.status(500).send('<h1>Unable to load public project</h1>');
  }
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../client')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(path.join(__dirname, '../client/index.html'));
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`CollabSphere server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

startServer();
