import React, { useState, useEffect } from 'react';
import { getDashboard } from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboard();
        setStats(res.data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      }
      setLoading(false);
    };

    fetchDashboard();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div className="container">
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Total Earnings</h3>
          <p>₹ {stats.totalEarnings}</p>
        </div>

        <div className="stat-card">
          <h3>Total Hours Logged</h3>
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

      <h3 style={{ marginBottom: '16px', color: '#1a1a2e' }}>Recent Sessions</h3>

      {stats.recentSessions && stats.recentSessions.length === 0 ? (
        <p className="no-data">No sessions logged yet.</p>
      ) : (
        stats.recentSessions && stats.recentSessions.map((session) => (
          <div className="card" key={session._id}>
            <div className="card-info">
              <h3>{session.taskDescription}</h3>
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