const authForm = document.getElementById('authForm');
const authStatus = document.getElementById('authStatus');
const submitAuthBtn = document.getElementById('submitAuthBtn');
const toggleModeBtn = document.getElementById('toggleModeBtn');
const logoutBtn = document.getElementById('logoutBtn');
const projectForm = document.getElementById('projectForm');
const projectList = document.getElementById('projectList');
const selectedProjectInfo = document.getElementById('selectedProjectInfo');
const projectAnalytics = document.getElementById('projectAnalytics');
const projectShareLink = document.getElementById('projectShareLink');
const memberForm = document.getElementById('memberForm');
const noteForm = document.getElementById('noteForm');
const notesList = document.getElementById('notesList');
const fileForm = document.getElementById('fileForm');
const fileList = document.getElementById('fileList');
const aiOutput = document.getElementById('aiOutput');
const explainBtn = document.getElementById('explainBtn');
const documentBtn = document.getElementById('documentBtn');

const state = {
  token: localStorage.getItem('collabsphere_token') || '',
  mode: 'register',
  projects: [],
  selectedProjectId: null
};

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const formatInlineMarkdown = (text = '') => {
  let formatted = escapeHtml(text);
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  return formatted;
};

const renderMarkdown = (markdown = '') => {
  if (!markdown.trim()) {
    return '<p>No content yet.</p>';
  }

  const lines = markdown.split('\n');
  let html = '';
  let inList = false;

  const flushList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };

  lines.forEach((line) => {
    const clean = line.trim();

    if (!clean) {
      flushList();
      html += '<br />';
      return;
    }

    if (/^###\s+/.test(clean)) {
      flushList();
      html += `<h3>${formatInlineMarkdown(clean.replace(/^###\s+/, ''))}</h3>`;
      return;
    }

    if (/^##\s+/.test(clean)) {
      flushList();
      html += `<h2>${formatInlineMarkdown(clean.replace(/^##\s+/, ''))}</h2>`;
      return;
    }

    if (/^#\s+/.test(clean)) {
      flushList();
      html += `<h1>${formatInlineMarkdown(clean.replace(/^#\s+/, ''))}</h1>`;
      return;
    }

    if (/^[-*]\s+/.test(clean)) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${formatInlineMarkdown(clean.replace(/^[-*]\s+/, ''))}</li>`;
      return;
    }

    if (/^\d+\.\s+/.test(clean)) {
      if (!inList) {
        html += '<ol>';
        inList = true;
      }
      html += `<li>${formatInlineMarkdown(clean.replace(/^\d+\.\s+/, ''))}</li>`;
      return;
    }

    flushList();
    html += `<p>${formatInlineMarkdown(clean)}</p>`;
  });

  flushList();
  return html;
};

function setAuthMode(mode) {
  state.mode = mode;
  submitAuthBtn.textContent = mode === 'register' ? 'Register' : 'Login';
  toggleModeBtn.textContent = mode === 'register' ? 'Switch to Login' : 'Switch to Register';
  document.getElementById('nameInput').style.display = mode === 'register' ? 'block' : 'none';
}

function setStatus(message, isError = false) {
  authStatus.textContent = message;
  authStatus.style.color = isError ? '#fca5a5' : '#d1fae5';
}

function setLoggedInUI() {
  logoutBtn.classList.remove('hidden');
  authForm.querySelector('input[type="email"]').disabled = true;
  authForm.querySelector('input[type="password"]').disabled = true;
  document.getElementById('nameInput').disabled = true;
}

function setLoggedOutUI() {
  logoutBtn.classList.add('hidden');
  authForm.querySelector('input[type="email"]').disabled = false;
  authForm.querySelector('input[type="password"]').disabled = false;
  document.getElementById('nameInput').disabled = false;
}

function updateProjectMetrics(analytics = {}) {
  projectAnalytics.innerHTML = `
    <div class="analytics-box"><span>Members</span><strong>${analytics.members || 0}</strong></div>
    <div class="analytics-box"><span>Notes</span><strong>${analytics.notes || 0}</strong></div>
    <div class="analytics-box"><span>Files</span><strong>${analytics.files || 0}</strong></div>
    <div class="analytics-box"><span>Size</span><strong>${Math.round((analytics.totalSize || 0) / 1024)} KB</strong></div>
  `;
}

function updateShareLink(project = null) {
  if (!project || !project.isPublic) {
    projectShareLink.innerHTML = 'Project is private. Make it public to create a shareable link.';
    return;
  }

  const url = `${window.location.origin}/public/${project._id}`;
  projectShareLink.innerHTML = `Public link: <a href="${url}" target="_blank" rel="noreferrer">${url}</a>`;
}

async function api(path, options = {}) {
  const headers = {
    ...(options.headers || {})
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('nameInput').value.trim();
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value;

  try {
    const endpoint = state.mode === 'register' ? '/auth/register' : '/auth/login';
    const payload = state.mode === 'register'
      ? { name, email, password }
      : { email, password };

    const result = await api(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    state.token = result.token;
    localStorage.setItem('collabsphere_token', result.token);
    setStatus(`${state.mode === 'register' ? 'Registered' : 'Logged in'} successfully.`);
    setLoggedInUI();
    await loadProjects();
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function loadProjects() {
  if (!state.token) {
    return;
  }

  try {
    const projects = await api('/projects');
    state.projects = projects;

    if (!state.selectedProjectId && projects.length) {
      state.selectedProjectId = projects[0]._id;
    }

    renderProjects();
    if (state.selectedProjectId) {
      await loadProjectDetails(state.selectedProjectId);
    }
  } catch (error) {
    console.error(error);
  }
}

function renderProjects() {
  if (!state.projects.length) {
    projectList.innerHTML = '<div class="project-card">No projects yet. Create one to begin.</div>';
    return;
  }

  projectList.innerHTML = state.projects.map((project) => `
    <div class="project-card ${project._id === state.selectedProjectId ? 'active' : ''}" data-id="${project._id}">
      <h3>${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.description || 'No description')}</p>
      <div>
        ${project.tags?.map((tag) => `<span class="small-tag">${escapeHtml(tag)}</span>`).join('') || ''}
      </div>
    </div>
  `).join('');

  projectList.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.selectedProjectId = card.dataset.id;
      renderProjects();
      loadProjectDetails(state.selectedProjectId);
    });
  });
}

async function loadProjectDetails(projectId) {
  if (!projectId) {
    selectedProjectInfo.innerHTML = '<p>Select a project to work on.</p>';
    projectAnalytics.innerHTML = '';
    projectShareLink.innerHTML = '';
    return;
  }

  try {
    const project = state.projects.find((item) => item._id === projectId);
    const [notes, files, analyticsData] = await Promise.all([
      api(`/notes/project/${projectId}`),
      api(`/files/project/${projectId}`),
      api(`/projects/${projectId}/analytics`)
    ]);

    const analytics = analyticsData.analytics || {};
    selectedProjectInfo.innerHTML = `
      <h3>${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.description || 'No description')}</p>
      <small>${project.isPublic ? 'Public project' : 'Private project'}</small>
      <div class="member-list">${(project.members || []).map((member) => `<span class="small-tag">${escapeHtml(member.name || member.email || 'Member')}</span>`).join(' ') || '<span>No members yet.</span>'}</div>
    `;

    updateProjectMetrics(analytics);
    updateShareLink(project);

    notesList.innerHTML = notes.length
      ? notes.map((note) => `
          <div class="note-item">
            <strong>${escapeHtml(note.title || 'Untitled note')}</strong>
            <div class="markdown-preview">${renderMarkdown(note.content || '')}</div>
          </div>
        `).join('')
      : '<p>No notes yet.</p>';

    fileList.innerHTML = files.length
      ? files.map((file) => {
          const preview = file.mimeType?.startsWith('image/')
            ? `<img src="${file.path}" alt="${escapeHtml(file.originalName)}" style="max-width: 100%; max-height: 180px; border-radius: 8px; margin-top: 8px;" />`
            : '';
          return `
            <div class="file-item">
              <a href="${file.path}" target="_blank" rel="noreferrer">${escapeHtml(file.originalName)}</a>
              <div>${escapeHtml(file.mimeType || 'file')} • ${Math.round((file.size || 0) / 1024)} KB</div>
              ${preview}
            </div>
          `;
        }).join('')
      : '<p>No files uploaded yet.</p>';
  } catch (error) {
    console.error(error);
    setStatus(error.message, true);
  }
}

async function handleProjectSubmit(event) {
  event.preventDefault();

  if (!state.token) {
    setStatus('Please log in first.', true);
    return;
  }

  try {
    const title = document.getElementById('projectTitle').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const isPublic = document.getElementById('projectPublic').checked;
    const memberEmails = document.getElementById('projectMembers').value.trim();

    if (!title) {
      setStatus('Project title is required.', true);
      return;
    }

    await api('/projects', {
      method: 'POST',
      body: JSON.stringify({ title, description, isPublic, memberEmails })
    });

    projectForm.reset();
    await loadProjects();
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function handleMemberSubmit(event) {
  event.preventDefault();

  if (!state.selectedProjectId) {
    setStatus('Select a project before adding a member.', true);
    return;
  }

  const email = document.getElementById('memberEmail').value.trim();
  if (!email) {
    setStatus('Please enter a member email.', true);
    return;
  }

  try {
    await api(`/projects/${state.selectedProjectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    memberForm.reset();
    await loadProjects();
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function handleNoteSubmit(event) {
  event.preventDefault();

  if (!state.selectedProjectId) {
    setStatus('Select a project before creating a note.', true);
    return;
  }

  try {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();

    await api('/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content, projectId: state.selectedProjectId })
    });

    noteForm.reset();
    await loadProjectDetails(state.selectedProjectId);
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function handleFileSubmit(event) {
  event.preventDefault();

  if (!state.selectedProjectId) {
    setStatus('Select a project before uploading.', true);
    return;
  }

  const fileInput = document.getElementById('fileInput');
  if (!fileInput.files.length) {
    setStatus('Choose a file first.', true);
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  formData.append('projectId', state.selectedProjectId);

  try {
    const response = await fetch('/api/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.token}`
      },
      body: formData
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    fileForm.reset();
    await loadProjectDetails(state.selectedProjectId);
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function handleAiExplain() {
  const codeText = document.getElementById('aiCodeInput').value.trim();
  if (!codeText) {
    aiOutput.textContent = 'Paste some code or text first.';
    return;
  }

  try {
    const response = await api('/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ code: codeText })
    });
    aiOutput.textContent = response.result;
  } catch (error) {
    aiOutput.textContent = error.message;
  }
}

async function handleAiDocument() {
  const text = document.getElementById('aiCodeInput').value.trim();
  if (!text) {
    aiOutput.textContent = 'Add a project title and description first.';
    return;
  }

  try {
    const response = await api('/ai/document', {
      method: 'POST',
      body: JSON.stringify({
        projectTitle: state.projects[0]?.title || 'New project',
        description: text
      })
    });
    aiOutput.textContent = response.result;
  } catch (error) {
    aiOutput.textContent = error.message;
  }
}

authForm.addEventListener('submit', handleAuthSubmit);
toggleModeBtn.addEventListener('click', () => {
  setAuthMode(state.mode === 'register' ? 'login' : 'register');
});
projectForm.addEventListener('submit', handleProjectSubmit);
memberForm.addEventListener('submit', handleMemberSubmit);
noteForm.addEventListener('submit', handleNoteSubmit);
fileForm.addEventListener('submit', handleFileSubmit);
explainBtn.addEventListener('click', handleAiExplain);
documentBtn.addEventListener('click', handleAiDocument);
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('collabsphere_token');
  state.token = '';
  state.projects = [];
  state.selectedProjectId = null;
  projectList.innerHTML = '';
  notesList.innerHTML = '';
  fileList.innerHTML = '';
  selectedProjectInfo.innerHTML = '<p>Select a project to work on.</p>';
  projectAnalytics.innerHTML = '';
  projectShareLink.innerHTML = '';
  setStatus('Logged out successfully.');
  setLoggedOutUI();
  setAuthMode('register');
  authForm.reset();
});

setAuthMode('register');

if (state.token) {
  setLoggedInUI();
  loadProjects();
}
