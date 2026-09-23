import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import FilesPage from './pages/FilesPage';
import ProjectsPage from './pages/ProjectsPage';

const navItems = [
  { label: 'Overview', icon: '◫', to: '/overview', count: '12' },
  { label: 'Projects', icon: '▣', to: '/projects', count: '7' },
  { label: 'Files', icon: '◌', to: '/files', count: '245' },
  { label: 'Calendar', icon: '◍', to: '/calendar', count: '4' },
  { label: 'Messages', icon: '✦', to: '/messages', count: '18' },
];

const timeline = [
  {
    title: 'Design review completed',
    time: 'Today · 09:30 AM',
    text: 'The mobile UX review passed with three key refinements for onboarding clarity.',
  },
  {
    title: 'AI summary generated',
    time: 'Today · 08:00 AM',
    text: 'The workspace assistant highlighted blocked tasks and suggested shipping priorities.',
  },
  {
    title: 'Sprint planning locked',
    time: 'Yesterday · 05:45 PM',
    text: 'The team aligned on a three-week delivery window with zero critical dependencies.',
  },
];

const activity = [
  { name: 'Alicia', action: 'updated the launch checklist', time: '2 min ago' },
  { name: 'Noah', action: 'shared the customer research deck', time: '31 min ago' },
  { name: 'Priya', action: 'left a note on the onboarding flow', time: '1 hr ago' },
];

const membersSeed = [
  { name: 'Alicia', role: 'Product lead', status: 'online', color: 'primary' },
  { name: 'Noah', role: 'Design', status: 'away', color: 'purple' },
  { name: 'Priya', role: 'Engineering', status: 'online', color: 'green' },
  { name: 'Leo', role: 'Ops', status: 'away', color: 'orange' },
];

const emptyAuth = { name: '', email: '', password: '' };
const emptyProject = { title: '', description: '', memberEmails: '', isPublic: false };

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('collabsphere_token');

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && !options.skipAuth ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

function AppShell() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('register');
  const [authForm, setAuthForm] = useState(emptyAuth);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [memberEmail, setMemberEmail] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('collabsphere_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId) || projects[0] || null,
    [projects, selectedProjectId]
  );

  const loadProjects = async () => {
    if (!localStorage.getItem('collabsphere_token')) {
      setProjects([]);
      return;
    }

    try {
      const data = await apiRequest('/projects');
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0]._id);
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        mode === 'login'
          ? { email: authForm.email, password: authForm.password }
          : authForm;

      const data = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      localStorage.setItem('collabsphere_token', data.token);
      localStorage.setItem('collabsphere_user', JSON.stringify(data.user));
      setUser(data.user);
      setAuthForm(emptyAuth);
      navigate('/overview');
      setMessage(mode === 'login' ? 'Login successful.' : 'Registration successful.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        title: projectForm.title,
        description: projectForm.description,
        isPublic: projectForm.isPublic,
        memberEmails: projectForm.memberEmails
          .split(',')
          .map((email) => email.trim())
          .filter(Boolean),
      };

      const created = await apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setProjects((prev) => [created, ...prev]);
      setSelectedProjectId(created._id);
      setProjectForm(emptyProject);
      setMessage('Project created successfully.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    if (!selectedProject?._id || !memberEmail.trim()) {
      setMessage('Choose a project and enter a member email.');
      return;
    }

    try {
      const response = await apiRequest(`/projects/${selectedProject._id}/members`, {
        method: 'POST',
        body: JSON.stringify({ email: memberEmail.trim() }),
      });

      setProjects((prev) =>
        prev.map((project) =>
          project._id === selectedProject._id ? response.project : project
        )
      );
      setMemberEmail('');
      setMessage('Member added successfully.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('collabsphere_token');
    localStorage.removeItem('collabsphere_user');
    setUser(null);
    setProjects([]);
    setSelectedProjectId('');
    setMessage('Logged out successfully.');
    navigate('/login');
  };

  const stats = [
    { label: 'Active projects', value: String(projects.length || 0), trend: '+18%', type: 'up', icon: '▣' },
    { label: 'Team velocity', value: '86%', trend: '+12%', type: 'up', icon: '↗' },
    { label: 'Tasks done', value: '1.4k', trend: '-4%', type: 'down', icon: '✓' },
    { label: 'AI insights', value: '42', trend: '+9%', type: 'up', icon: '✦' },
  ];

  const displayMembers = user ? membersSeed : [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo-mark">C</div>
          <div className="brand-copy">
            <strong>CollabSphere</strong>
            <span>Workspace</span>
          </div>
        </div>

        <nav className="nav" aria-label="Sidebar navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-left">
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </span>
              <small>{item.count}</small>
            </NavLink>
          ))}
        </nav>

        {!user ? (
          <div className="auth-box">
            <div className="section-label">Access</div>
            <div className="toggle-group">
              <button type="button" className={mode === 'register' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setMode('register')}>
                Register
              </button>
              <button type="button" className={mode === 'login' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setMode('login')}>
                Login
              </button>
            </div>

            <form className="stack-form" onSubmit={handleAuth}>
              {mode === 'register' && (
                <label className="field">
                  <span>Name</span>
                  <input
                    type="text"
                    value={authForm.name}
                    onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </label>
              )}

              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                  placeholder="••••••••"
                  required
                />
              </label>

              <button className="primary-btn full" type="submit" disabled={loading}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
              </button>
            </form>
          </div>
        ) : (
          <div className="team-card user-card">
            <h3>Signed in</h3>
            <div className="member-row">
              <div className="member-meta">
                <div className="avatar primary">{user.name?.slice(0, 1) || 'U'}</div>
                <div>
                  <div className="member-name">{user.name}</div>
                  <div className="member-role">{user.email}</div>
                </div>
              </div>
            </div>
            <button className="secondary-btn full" type="button" onClick={handleLogout}>Logout</button>
          </div>
        )}

        <div className="section-label">Team</div>
        <div className="team-card">
          <h3>Core crew</h3>
          <div className="member-list">
            {displayMembers.map((member) => (
              <div key={member.name} className="member-row">
                <div className="member-meta">
                  <div className={`avatar ${member.color}`}>{member.name.slice(0, 1)}</div>
                  <div>
                    <div className="member-name">{member.name}</div>
                    <div className="member-role">{member.role}</div>
                  </div>
                </div>
                <span className={`member-status ${member.status}`}>{member.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <div>
            <strong>8.2h</strong>
            <small>Focus time</small>
          </div>
          <button className="secondary-btn" type="button">Sync</button>
        </div>
      </aside>

      <main className="main-panel">
        {message && <div className="status-message">{message}</div>}

        <Routes>
          <Route path="/" element={user ? <Navigate to="/overview" replace /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<AuthPage mode={mode} setMode={setMode} authForm={authForm} setAuthForm={setAuthForm} handleAuth={handleAuth} loading={loading} />} />
          <Route
            path="/overview"
            element={<Dashboard user={user} projects={projects} selectedProject={selectedProject} stats={stats} timeline={timeline} activity={activity} displayMembers={displayMembers} />}
          />
          <Route
            path="/projects"
            element={<ProjectsPage user={user} projects={projects} selectedProject={selectedProject} projectForm={projectForm} setProjectForm={setProjectForm} memberEmail={memberEmail} setMemberEmail={setMemberEmail} handleProjectCreate={handleProjectCreate} handleAddMember={handleAddMember} loading={loading} setSelectedProjectId={setSelectedProjectId} />}
          />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/calendar" element={<Navigate to="/overview" replace />} />
          <Route path="/messages" element={<Navigate to="/overview" replace />} />
          <Route path="*" element={<Navigate to={user ? '/overview' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
