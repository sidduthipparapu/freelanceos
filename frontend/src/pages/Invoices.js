import React, { useState, useEffect } from 'react';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, getClients, getProjects } from '../utils/api';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    amount: '',
    dueDate: '',
    status: 'draft',
  });

  const fetchInvoices = async () => {
    try {
      const res = await getInvoices();
      setInvoices(res.data);
    } catch (err) {
      setError('Failed to load invoices.');
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

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects.');
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchClients();
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingInvoice(null);
    setFormData({
      clientId: '',
      projectId: '',
      amount: '',
      dueDate: '',
      status: 'draft',
    });
    setShowModal(true);
  };

  const openEditModal = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      clientId: invoice.clientId._id || invoice.clientId,
      projectId: invoice.projectId._id || invoice.projectId,
      amount: invoice.amount,
      dueDate: invoice.dueDate ? invoice.dueDate.substring(0, 10) : '',
      status: invoice.status,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingInvoice(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInvoice) {
        await updateInvoice(editingInvoice._id, formData);
      } else {
        await createInvoice(formData);
      }
      fetchInvoices();
      closeModal();
    } catch (err) {
      setError('Failed to save invoice.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(id);
        fetchInvoices();
      } catch (err) {
        setError('Failed to delete invoice.');
      }
    }
  };

  const getClientName = (invoice) => {
    if (invoice.clientId && invoice.clientId.name) {
      return invoice.clientId.name;
    }
    return 'Unknown Client';
  };

  const getProjectTitle = (invoice) => {
    if (invoice.projectId && invoice.projectId.title) {
      return invoice.projectId.title;
    }
    return 'Unknown Project';
  };

  if (loading) return <p className="text-center mt-10">Loading invoices...</p>;

  return (
    <div className="container">
      <div className="page-header">
        <h2>Invoices</h2>
        <button className="btn btn-small btn-add" onClick={openAddModal}>
          + Add Invoice
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {invoices.length === 0 ? (
        <p className="no-data">No invoices created yet.</p>
      ) : (
        invoices.map((invoice) => (
          <div className="card" key={invoice._id}>
            <div className="card-info">
              <h3>₹ {invoice.amount}</h3>
              <p>Client: {getClientName(invoice)}</p>
              <p>Project: {getProjectTitle(invoice)}</p>
              <p>Due Date: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'No due date'}</p>
              <span className={`badge badge-${invoice.status}`}>
                {invoice.status}
              </span>
            </div>
            <div className="card-actions">
              <button
                className="btn btn-small btn-edit"
                onClick={() => openEditModal(invoice)}
              >
                Edit
              </button>
              <button
                className="btn btn-small btn-delete"
                onClick={() => handleDelete(invoice._id)}
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
            <h3>{editingInvoice ? 'Edit Invoice' : 'Add New Invoice'}</h3>
            <form onSubmit={handleSubmit}>
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
                <label>Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
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
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
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
                  {editingInvoice ? 'Update' : 'Add Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
// ```

// ---

// **What this does:**

// - Fetches invoices, clients and projects on page load
// - Each invoice card shows amount, client, project, due date and status badge
// - Status dropdown has all 4 states — Draft, Sent, Paid, Overdue
// - Edit modal pre-fills all existing invoice data
// - Same modal reused for Add and Edit

// ⚠️ You must have clients and projects added before creating an invoice. Both dropdowns depend on existing data.

// ---

// **Frontend is now 100% complete. ✅**

// All pages are done:
// ```
// ✅ index.html
// ✅ App.css
// ✅ index.js
// ✅ AuthContext.js
// ✅ api.js
// ✅ App.js
// ✅ Navbar.js
// ✅ Login.js
// ✅ Register.js
// ✅ Dashboard.js
// ✅ Clients.js
// ✅ Projects.js
// ✅ Sessions.js
// ✅ Invoices.js