import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../utils/api';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await getProfile();
        setUserName(res.data.name);
        setProfileImage(res.data.profileImage);
      } catch (err) {
        console.log('Could not load profile in navbar');
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getImageUrl = (filename) => {
    if (!filename) return null;
    return `http://localhost:5000/uploads/${filename}`;
  };

  return (
    <div className="navbar">
      <h2>FreelanceOS</h2>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/">Dashboard</Link>
        <Link to="/clients">Clients</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/sessions">Sessions</Link>
        <Link to="/invoices">Invoices</Link>

        {/* ─── PROFILE LINK ─── */}
        <Link
          to="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: '20px',
            textDecoration: 'none',
            color: 'white',
          }}
        >
          {/* Profile Image or Initial */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#e94560',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {profileImage ? (
              <img
                src={getImageUrl(profileImage)}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <span style={{
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
              }}>
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </span>
            )}
          </div>

          {/* User Name */}
          <span style={{ fontSize: '14px' }}>
            {userName ? userName.split(' ')[0] : 'Profile'}
          </span>
        </Link>

        {/* ─── LOGOUT BUTTON ─── */}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Navbar;