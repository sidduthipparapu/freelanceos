import React, { useState, useEffect } from 'react';
import { getClients, createClient, updateClient, deleteClient } from '../utils/api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
  });

  const fetchClients = async () => {
    try {
      const res = await getClients();
      setClients(res.data);
    } catch (err) {
      setError('Failed to load clients.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', status: 'active' });
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      status: client.status,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await updateClient(editingClient._id, formData);
      } else {
        await createClient(formData);
      }
      fetchClients();
      closeModal();
    } catch (err) {
      setError('Failed to save client.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(id);
        fetchClients();
      } catch (err) {
        setError('Failed to delete client.');
      }
    }
  };

  if (loading) return <p className="text-center mt-10">Loading clients...</p>;

  return (
    <div className="container">
      <div className="page-header">
        <h2>Clients</h2>
        <button className="btn btn-small btn-add" onClick={openAddModal}>
          + Add Client
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {clients.length === 0 ? (
        <p className="no-data">No clients added yet.</p>
      ) : (
        clients.map((client) => (
          <div className="card" key={client._id}>
            <div className="card-info">
              <h3>{client.name}</h3>
              <p>Email: {client.email}</p>
              <p>Phone: {client.phone}</p>
              <span className={`badge badge-${client.status}`}>
                {client.status}
              </span>
            </div>
            <div className="card-actions">
              <button
                className="btn btn-small btn-edit"
                onClick={() => openEditModal(client)}
              >
                Edit
              </button>
              <button
                className="btn btn-small btn-delete"
                onClick={() => handleDelete(client._id)}
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
            <h3>{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
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
                  <option value="inactive">Inactive</option>
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
                  {editingClient ? 'Update' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;