export default function Dashboard({ user, projects, selectedProject, stats, timeline, activity, displayMembers }) {
  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Workspace overview</p>
          <h1>{user ? `Good morning, ${user.name.split(' ')[0]}` : 'Welcome to CollabSphere'}</h1>
        </div>
        <div className="top-actions">
          <button type="button" className="ghost-btn">Share</button>
          <button type="button" className="primary-btn">New project</button>
        </div>
      </header>

      <section className="stats-grid" aria-label="Highlights">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <div className="stat-label">
              <span>{stat.label}</span>
              <span className="stat-icon">{stat.icon}</span>
            </div>
            <div className="stat-value">
              <strong>{stat.value}</strong>
              <span className={`trend ${stat.type}`}>{stat.trend}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Recent projects</h2>
            <span className="filter-tag">Live</span>
          </div>

          <div className="project-grid">
            {(projects.length > 0 ? projects : [{ _id: 'demo', title: 'Apple Phone', description: 'Product research and launch planning.', tags: ['Product', 'Research'], members: [{ name: 'Devendra' }], isPublic: true }, { _id: 'demo-2', title: 'Chrome', description: 'Browser experience and QA tracking.', tags: ['Browser', 'Frontend'], members: [{ name: 'Tannu' }], isPublic: false }]).map((project) => (
              <button key={project._id} type="button" className={`project-card ${selectedProject?._id === project._id ? 'featured' : ''}`}>
                <div className="project-card-top">
                  <span className="project-icon">{project.title.slice(0, 1).toUpperCase()}</span>
                  <span className={`status-pill ${project.isPublic ? 'live' : 'review'}`}>{project.isPublic ? 'public' : 'private'}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.description || 'No description yet.'}</p>
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
            ))}
          </div>
        </div>

        <aside className="panel ai-panel">
          <div className="panel-header">
            <h3>Team members</h3>
            <span className="filter-tag">4 online</span>
          </div>

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
        </aside>
      </section>

      <section className="bottom-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Delivery timeline</h3>
            <span className="filter-tag">6 milestones</span>
          </div>

          <ul className="timeline">
            {timeline.map((item) => (
              <li key={item.title} className="timeline-item">
                <span className="timeline-dot" aria-hidden="true" />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.time}</span>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Recent activity</h3>
            <span className="filter-tag">Today</span>
          </div>

          <div className="activity-list">
            {activity.map((item) => (
              <div key={item.name} className="activity-item">
                <div className={`avatar ${item.name === 'Alicia' ? 'primary' : item.name === 'Noah' ? 'purple' : 'green'}`}>
                  {item.name.slice(0, 1)}
                </div>
                <div>
                  <strong>{item.name}</strong>
                  <div>{item.action}</div>
                  <small>{item.time}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
