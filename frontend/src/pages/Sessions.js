import React, { useState, useEffect } from 'react';
import { getSessions, createSession, updateSession, deleteSession, getProjects } from '../utils/api';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  const [formData, setFormData] = useState({
    projectId: '',
    date: '',
    hoursWorked: '',
    taskDescription: '',
  });

  const fetchSessions = async () => {
    try {
      const res = await getSessions();
      setSessions(res.data);
    } catch (err) {
      setError('Failed to load sessions.');
    }
    setLoading(false);
  };

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects.');
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingSession(null);
    setFormData({
      projectId: '',
      date: '',
      hoursWorked: '',
      taskDescription: '',
    });
    setShowModal(true);
  };

  const openEditModal = (session) => {
    setEditingSession(session);
    setFormData({
      projectId: session.projectId._id || session.projectId,
      date: session.date ? session.date.substring(0, 10) : '',
      hoursWorked: session.hoursWorked,
      taskDescription: session.taskDescription,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSession(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSession) {
        await updateSession(editingSession._id, formData);
      } else {
        await createSession(formData);
      }
      fetchSessions();
      closeModal();
    } catch (err) {
      setError('Failed to save session.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await deleteSession(id);
        fetchSessions();
      } catch (err) {
        setError('Failed to delete session.');
      }
    }
  };

  const getProjectTitle = (session) => {
    if (session.projectId && session.projectId.title) {
      return session.projectId.title;
    }
    return 'Unknown Project';
  };

  if (loading) return <p className="text-center mt-10">Loading sessions...</p>;

  return (
    <div className="container">
      <div className="page-header">
        <h2>Work Sessions</h2>
        <button className="btn btn-small btn-add" onClick={openAddModal}>
          + Log Session
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {sessions.length === 0 ? (
        <p className="no-data">No sessions logged yet.</p>
      ) : (
        sessions.map((session) => (
          <div className="card" key={session._id}>
            <div className="card-info">
              <h3>{session.taskDescription}</h3>
              <p>Project: {getProjectTitle(session)}</p>
              <p>Date: {new Date(session.date).toLocaleDateString()}</p>
              <p>Hours: {session.hoursWorked} hrs</p>
              <p>Earnings: ₹ {session.earnings}</p>
            </div>
            <div className="card-actions">
              <button
                className="btn btn-small btn-edit"
                onClick={() => openEditModal(session)}
              >
                Edit
              </button>
              <button
                className="btn btn-small btn-delete"
                onClick={() => handleDelete(session._id)}
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
            <h3>{editingSession ? 'Edit Session' : 'Log New Session'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project</label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hours Worked</label>
                <input
                  type="number"
                  name="hoursWorked"
                  value={formData.hoursWorked}
                  onChange={handleChange}
                  min="0.5"
                  step="0.5"
                  required
                />
              </div>
              <div className="form-group">
                <label>Task Description</label>
                <textarea
                  name="taskDescription"
                  value={formData.taskDescription}
                  onChange={handleChange}
                  required
                />
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
                  {editingSession ? 'Update' : 'Log Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;