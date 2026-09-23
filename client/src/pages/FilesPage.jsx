const files = [
  { name: 'Product brainstorming.pdf', owner: 'Devendra', size: '2.4 MB', updated: '2 hours ago' },
  { name: 'Launch checklist.md', owner: 'Aman', size: '48 KB', updated: 'Today' },
  { name: 'Roadmap-notes.txt', owner: 'Tannu', size: '16 KB', updated: 'Yesterday' },
  { name: 'User research.csv', owner: 'Rinki', size: '860 KB', updated: '3 days ago' },
];

export default function FilesPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Files</h1>
        </div>
        <button type="button" className="primary-btn">
          + Upload file
        </button>
      </header>

      <section className="panel">
        <div className="panel-header">
          <h2>Recent files</h2>
          <span className="filter-tag">12 items</span>
        </div>

        <div className="file-table">
          <div className="file-table-header">
            <span>Name</span>
            <span>Owner</span>
            <span>Size</span>
            <span>Updated</span>
          </div>

          {files.map((file) => (
            <div key={file.name} className="file-row">
              <span>{file.name}</span>
              <span>{file.owner}</span>
              <span>{file.size}</span>
              <span>{file.updated}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
