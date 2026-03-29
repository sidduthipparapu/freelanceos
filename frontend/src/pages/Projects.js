import React, { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject, getClients } from '../utils/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    hourlyRate: '',
    deadline: '',
    status: 'active',
  });

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects.');
    }
    setLoading(false);
  };

  const fetchClients = async () => {
    try {
      const res = await getClients();
      setClients(res.data);
    } catch (err) {
      setError('Failed to load clients.');
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      clientId: '',
      hourlyRate: '',
      deadline: '',
      status: 'active',
    });
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      clientId: project.clientId._id || project.clientId,
      hourlyRate: project.hourlyRate,
      deadline: project.deadline ? project.deadline.substring(0, 10) : '',
      status: project.status,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await updateProject(editingProject._id, formData);
      } else {
        await createProject(formData);
      }
      fetchProjects();
      closeModal();
    } catch (err) {
      setError('Failed to save project.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        fetchProjects();
      } catch (err) {
        setError('Failed to delete project.');
      }
    }
  };

  const getClientName = (project) => {
    if (project.clientId && project.clientId.name) {
      return project.clientId.name;
    }
    return 'Unknown Client';
  };

  if (loading) return <p className="text-center mt-10">Loading projects...</p>;

  return (
    <div className="container">
      <div className="page-header">
        <h2>Projects</h2>
        <button className="btn btn-small btn-add" onClick={openAddModal}>
          + Add Project
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {projects.length === 0 ? (
        <p className="no-data">No projects added yet.</p>
      ) : (
        projects.map((project) => (
          <div className="card" key={project._id}>
            <div className="card-info">
              <h3>{project.title}</h3>
              <p>Client: {getClientName(project)}</p>
              <p>Hourly Rate: ₹ {project.hourlyRate}</p>
              <p>Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</p>
              <span className={`badge badge-${project.status}`}>
                {project.status}
              </span>
            </div>
            <div className="card-actions">
              <button
                className="btn btn-small btn-edit"
                onClick={() => openEditModal(project)}
              >
                Edit
              </button>
              <button
                className="btn btn-small btn-delete"
                onClick={() => handleDelete(project._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Client</label>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Hourly Rate (₹)</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="onhold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-small btn-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-small btn-submit"
                >
                  {editingProject ? 'Update' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;