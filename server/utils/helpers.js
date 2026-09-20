module.exports = {
  getProjectSummary: (project = {}) => ({
    id: project._id,
    title: project.title || 'Untitled project'
  })
};
