import React, { useState, useEffect } from 'react';
import { getDashboard } from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchDashboard = async (date) => {
    setLoading(true);
    setError('');
    try {
      const url = date ? `/dashboard?date=${date}` : '/dashboard';
      const res = await getDashboard(date);
      setStats(res.data);
    } catch (err) {
      setError('Failed to load dashboard data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard('');
  }, []);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchDashboard(date);
  };

  const handleClearDate = () => {
    setSelectedDate('');
    fetchDashboard('');
  };

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div className="container">
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      {/* ─── DATE FILTER ─── */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#555',
            marginRight: '10px'
          }}>
            Filter by Date:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>

        {selectedDate && (
          <button
            onClick={handleClearDate}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1a1a2e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Clear Filter
          </button>
        )}

        <p style={{
          fontSize: '13px',
          color: '#999',
          margin: '0'
        }}>
          {selectedDate
            ? `Showing data for: ${new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
            : 'Showing all time data'}
        </p>
      </div>

      {/* ─── STAT CARDS ─── */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>{selectedDate ? 'Earnings on this Day' : 'Total Earnings'}</h3>
          <p>₹ {stats.totalEarnings}</p>
        </div>

        <div className="stat-card">
          <h3>{selectedDate ? 'Hours on this Day' : 'Total Hours Logged'}</h3>
          <p>{stats.totalHours} hrs</p>
        </div>

        <div className="stat-card">
          <h3>Active Projects</h3>
          <p>{stats.activeProjects}</p>
        </div>

        <div className="stat-card">
          <h3>Overdue Invoices</h3>
          <p>{stats.overdueInvoices}</p>
        </div>
      </div>

      {/* ─── RECENT SESSIONS ─── */}
      <h3 style={{ marginBottom: '16px', color: '#1a1a2e' }}>
        {selectedDate ? 'Sessions on this Day' : 'Recent Sessions'}
      </h3>

      {stats.recentSessions && stats.recentSessions.length === 0 ? (
        <p className="no-data">
          {selectedDate
            ? 'No sessions found for this date.'
            : 'No sessions logged yet.'}
        </p>
      ) : (
        stats.recentSessions && stats.recentSessions.map((session) => (
          <div className="card" key={session._id}>
            <div className="card-info">
              <h3>{session.taskDescription}</h3>
              <p>Project: {session.projectId ? session.projectId.title : 'Unknown'}</p>
              <p>Hours: {session.hoursWorked} hrs</p>
              <p>Earnings: ₹ {session.earnings}</p>
              <p>Date: {new Date(session.date).toLocaleDateString()}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;