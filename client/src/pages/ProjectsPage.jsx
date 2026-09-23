export default function ProjectsPage({
  projects,
  selectedProject,
  projectForm,
  setProjectForm,
  memberEmail,
  setMemberEmail,
  handleProjectCreate,
  handleAddMember,
  loading,
  user,
  setSelectedProjectId,
}) {
  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Projects</h1>
        </div>
        <button type="button" className="primary-btn">
          + New project
        </button>
      </header>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Project board</h2>
            <span className="filter-tag">{user ? 'Your workspace' : 'Login to continue'}</span>
          </div>

          <form className="project-form" onSubmit={handleProjectCreate}>
            <div className="field-row two-col">
              <label className="field">
                <span>Project title</span>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(event) => setProjectForm({ ...projectForm, title: event.target.value })}
                  placeholder="Project title"
                  required
                />
              </label>

              <label className="field checkbox-field">
                <span>Public project</span>
                <input
                  type="checkbox"
                  checked={projectForm.isPublic}
                  onChange={(event) => setProjectForm({ ...projectForm, isPublic: event.target.checked })}
                />
              </label>
            </div>

            <label className="field">
              <span>Description</span>
              <textarea
                value={projectForm.description}
                onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })}
                placeholder="Describe the goal, tasks, and team notes for this project"
                rows="3"
              />
            </label>

            <label className="field">
              <span>Invite members by email</span>
              <input
                type="text"
                value={projectForm.memberEmails}
                onChange={(event) => setProjectForm({ ...projectForm, memberEmails: event.target.value })}
                placeholder="name@example.com, second@example.com"
              />
            </label>

            <button className="primary-btn full" type="submit" disabled={!user || loading}>
              {user ? 'Create project' : 'Login required'}
            </button>
          </form>

          <div className="project-grid">
            {projects.length > 0 ? (
              projects.map((project) => (
                <button
                  type="button"
                  key={project._id}
                  className={`project-card ${selectedProject?._id === project._id ? 'featured' : ''}`}
                  onClick={() => setSelectedProjectId(project._id)}
                >
                  <div className="project-card-top">
                    <span className="project-icon">{project.title.slice(0, 1).toUpperCase()}</span>
                    <span className={`status-pill ${project.isPublic ? 'live' : 'review'}`}>
                      {project.isPublic ? 'public' : 'private'}
                    </span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.description || 'No description provided yet.'}</p>

                  <div className="tag-row">
                    {(project.tags || []).map((tag) => (
                      <span key={`${project._id}-${tag}`} className="tag">{tag}</span>
                    ))}
                  </div>

                  <div className="project-metrics">
                    <span>{project.members?.length || 0} members</span>
                    <span>{project.isPublic ? 'Open' : 'Private'}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="empty-state">
                No projects yet. Create your first project and invite your team.
              </div>
            )}
          </div>
        </div>

        <aside className="panel ai-panel">
          <div className="panel-header">
            <h3>Selected project</h3>
            <span className="filter-tag">{selectedProject ? 'Active' : 'Idle'}</span>
          </div>

          {selectedProject ? (
            <>
              <div className="prompt-box">
                <h3>{selectedProject.title}</h3>
                <p>{selectedProject.description || 'No project description.'}</p>
              </div>

              <form className="member-form" onSubmit={handleAddMember}>
                <label className="field">
                  <span>Add member by email</span>
                  <input
                    type="email"
                    value={memberEmail}
                    onChange={(event) => setMemberEmail(event.target.value)}
                    placeholder="collaborator@example.com"
                  />
                </label>
                <button className="secondary-btn full" type="submit" disabled={!user}>
                  Add member
                </button>
              </form>

              <div className="member-block">
                <h4>Members</h4>
                <ul>
                  {(selectedProject.members || []).map((person) => (
                    <li key={person._id || person.email || person.name}>
                      {person.name || person.email || 'Member'}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="empty-state">Select a project or create one to start collaborating.</div>
          )}
        </aside>
      </section>
    </div>
  );
}
