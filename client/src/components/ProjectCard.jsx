export default function ProjectCard({ project }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: '1rem' }}>
      <h3>{project.title}</h3>
      <p>{project.description || 'No description'}</p>
    </div>
  );
}
