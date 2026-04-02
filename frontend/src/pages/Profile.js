import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile, uploadProfileImage } from '../utils/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
  });

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setProfile(res.data);
      setFormData({
        name: res.data.name,
        mobile: res.data.mobile || '',
      });
    } catch (err) {
      setError('Failed to load profile.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await updateProfile(formData);
      setProfile(res.data);
      setSuccess('Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setError('Only JPG and PNG images are allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB.');
      return;
    }

    setImageUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const res = await uploadProfileImage(formData);

      setProfile((prev) => ({
        ...prev,
        profileImage: res.data.profileImage,
      }));

      setSuccess('Profile image updated successfully.');
    } catch (err) {
      setError('Failed to upload image.');
    }

    setImageUploading(false);
  };

  const getImageUrl = (filename) => {
    if (!filename) return null;
    const base = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    return `${base}/uploads/${filename}`;
  };

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="container">
      <div className="page-header">
        <h2>My Profile</h2>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      {/* ─── PROFILE IMAGE SECTION ─── */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '30px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '30px',
        flexWrap: 'wrap',
      }}>
        {/* Image Display */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          overflow: 'hidden',
          background: '#1a1a2e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {profile && profile.profileImage ? (
            <img
              src={getImageUrl(profile.profileImage)}
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
              fontSize: '36px',
              fontWeight: 'bold',
            }}>
              {profile && profile.name
                ? profile.name.charAt(0).toUpperCase()
                : 'U'}
            </span>
          )}
        </div>

        {/* Upload Button */}
        <div>
          <p style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1a1a2e',
            marginBottom: '6px',
          }}>
            {profile && profile.name}
          </p>
          <p style={{
            fontSize: '14px',
            color: '#777',
            marginBottom: '12px',
          }}>
            {profile && profile.email}
          </p>

          <label style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: '#1a1a2e',
            color: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}>
            {imageUploading ? 'Uploading...' : 'Upload Photo'}
            <input
              type="file"
              accept="image/jpeg, image/jpg, image/png"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              disabled={imageUploading}
            />
          </label>

          <p style={{
            fontSize: '12px',
            color: '#999',
            marginTop: '6px',
          }}>
            JPG or PNG. Max size 2MB.
          </p>
        </div>
      </div>

      {/* ─── PROFILE DETAILS SECTION ─── */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h3 style={{ color: '#1a1a2e' }}>Account Details</h3>
          {!editing && (
            <button
              className="btn btn-small btn-edit"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        {!editing ? (
          // ─── VIEW MODE ───
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '150px 1fr',
              gap: '16px',
              fontSize: '15px',
            }}>
              <span style={{ color: '#777', fontWeight: 'bold' }}>Full Name</span>
              <span style={{ color: '#333' }}>{profile && profile.name}</span>

              <span style={{ color: '#777', fontWeight: 'bold' }}>Email</span>
              <span style={{ color: '#333' }}>{profile && profile.email}</span>

              <span style={{ color: '#777', fontWeight: 'bold' }}>Mobile</span>
              <span style={{ color: '#333' }}>
                {profile && profile.mobile
                  ? profile.mobile
                  : <span style={{ color: '#ccc' }}>Not added yet</span>}
              </span>

              <span style={{ color: '#777', fontWeight: 'bold' }}>Member Since</span>
              <span style={{ color: '#333' }}>
                {profile && new Date(profile.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        ) : (
          // ─── EDIT MODE ───
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email (cannot be changed)</label>
              <input
                type="email"
                value={profile && profile.email}
                disabled
                style={{
                  backgroundColor: '#f4f6f8',
                  color: '#999',
                  cursor: 'not-allowed',
                }}
              />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter your mobile number"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                type="submit"
                className="btn btn-small btn-submit"
              >
                Save Changes
              </button>
              <button
                type="button"
                className="btn btn-small btn-cancel"
                onClick={() => {
                  setEditing(false);
                  setError('');
                  setSuccess('');
                  setFormData({
                    name: profile.name,
                    mobile: profile.mobile || '',
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;