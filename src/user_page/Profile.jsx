import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import { getOrCreateProfile, updateProfile } from '../utils/profileUtils';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ message: '', severity: '' });
  const allowedUserIds = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136'];
  const isAdmin = user && allowedUserIds.includes(user.id);

  // Default profile picture (black silhouette)
  const defaultProfilePicture = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='35' r='20' fill='%23000'/%3E%3Cpath d='M 20 70 Q 20 55 50 55 Q 80 55 80 70 L 80 100 L 20 100 Z' fill='%23000'/%3E%3C/svg%3E";

  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    full_name: '',
    agent_code: '',
    bio: ''
  });

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Use the utility function to get or create profile
        const profileData = await getOrCreateProfile(user);
        
        if (profileData) {
          setProfile(profileData);
          // For admin users, always set name to "Admin"
          const isAdminUser = allowedUserIds.includes(user.id);
          setFormData({
            name: isAdminUser ? 'Admin' : (profileData.name || ''),
            full_name: isAdminUser ? 'Admin' : (profileData.full_name || profileData.name || ''),
            agent_code: profileData.agent_code || '',
            bio: profileData.bio || ''
          });
        }
      }
      
      setLoading(false);
    }
    
    fetchUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset form data to original profile data
    if (profile) {
      const isAdminUser = user && allowedUserIds.includes(user.id);
      setFormData({
        name: isAdminUser ? 'Admin' : (profile.name || ''),
        full_name: isAdminUser ? 'Admin' : (profile.full_name || profile.name || ''),
        agent_code: profile.agent_code || '',
        bio: profile.bio || ''
      });
    }
    setIsEditing(false);
    setAlert({ message: '', severity: '' });
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setAlert({ message: '', severity: '' });

    try {
      // For admin users, always ensure name is "Admin"
      const dataToSave = isAdmin 
        ? { ...formData, name: 'Admin', full_name: 'Admin' }
        : formData;
      
      const { data, error } = await updateProfile(user.id, dataToSave);

      if (error) {
        setAlert({ 
          message: '❌ Error updating profile: ' + error.message, 
          severity: 'error' 
        });
      } else {
        setProfile(data);
        setAlert({ 
          message: '✅ Profile updated successfully!', 
          severity: 'success' 
        });
        setIsEditing(false);
        
        // Clear alert after 3 seconds
        setTimeout(() => {
          setAlert({ message: '', severity: '' });
        }, 3000);
      }
    } catch (error) {
      setAlert({ 
        message: '❌ Error updating profile: ' + error.message, 
        severity: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
      <Navbar 
        showDashboardButton={true}
        showAdminButton={user && allowedUserIds.includes(user.id)}
        showTestingButton={user && allowedUserIds.includes(user.id)}
        showTambahListingButton={true}
        user={user}
      />
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', paddingTop: '6rem' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar 
        showDashboardButton={true}
        showAdminButton={user && allowedUserIds.includes(user?.id)}
        showTestingButton={user && allowedUserIds.includes(user?.id)}
        showTambahListingButton={true}
        user={user}
      />
      <div style={{ background: 'var(--background)', minHeight: '100vh', paddingBottom: '2rem', paddingTop: '6rem' }}>
        <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
          <div className="card shadow-lg" style={{ border: 'none', borderRadius: '12px' }}>
            <div className="card-header" style={{ 
              background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
              border: 'none',
              borderRadius: '12px 12px 0 0',
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 className="mb-0" style={{ color: '#fff', fontWeight: 700 }}>Profile</h3>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="btn btn-light btn-sm"
                  style={{ borderRadius: '8px', fontWeight: 600 }}
                >
                  <i className="bi bi-pencil me-2"></i>
                  Edit
                </button>
              )}
            </div>
            <div className="card-body" style={{ padding: '2rem' }}>
              {/* Alert Message */}
              {alert.message && (
                <div 
                  className={`alert ${alert.severity === 'success' ? 'alert-success' : 'alert-danger'}`}
                  role="alert"
                  style={{ borderRadius: '8px', marginBottom: '1.5rem' }}
                >
                  {alert.message}
                </div>
              )}

              <div className="text-center mb-4">
                <img
                  src={defaultProfilePicture}
                  alt="Profile"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    margin: '0 auto 1.5rem',
                    border: '2px solid var(--border-color)',
                    background: '#fff'
                  }}
                />
                <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {formData.name || formData.full_name || 'User'}
                </h4>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{user?.email || profile?.email}</p>
              </div>
              
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    Name
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      name="name"
                      className="form-control" 
                      value={formData.name} 
                      onChange={handleInputChange}
                      disabled={isAdmin}
                      readOnly={isAdmin}
                      style={{ 
                        background: isAdmin ? 'var(--background)' : '#fff',
                        cursor: isAdmin ? 'not-allowed' : 'text'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      padding: '0.375rem 0.75rem',
                      color: 'var(--text-primary)',
                      minHeight: '38px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {formData.name || <span className="text-muted">Not set</span>}
                    </div>
                  )}
                </div>

                {/* Full Name */}
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    Full Name
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      name="full_name"
                      className="form-control" 
                      value={formData.full_name} 
                      onChange={handleInputChange}
                      disabled={isAdmin}
                      readOnly={isAdmin}
                      style={{ 
                        background: isAdmin ? 'var(--background)' : '#fff',
                        cursor: isAdmin ? 'not-allowed' : 'text'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      padding: '0.375rem 0.75rem',
                      color: 'var(--text-primary)',
                      minHeight: '38px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {formData.full_name || <span className="text-muted">Not set</span>}
                    </div>
                  )}
                </div>

                {/* Agent Code */}
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    Agent Code
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      name="agent_code"
                      className="form-control" 
                      value={formData.agent_code} 
                      onChange={handleInputChange}
                      placeholder="Enter your agent code"
                      style={{ background: '#fff' }}
                    />
                  ) : (
                    <div style={{ 
                      padding: '0.375rem 0.75rem',
                      color: 'var(--text-primary)',
                      minHeight: '38px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {formData.agent_code || <span className="text-muted">Not set</span>}
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea 
                      name="bio"
                      className="form-control" 
                      value={formData.bio} 
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Tell us about yourself..."
                      style={{ 
                        background: '#fff',
                        resize: 'vertical'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      padding: '0.375rem 0.75rem',
                      color: 'var(--text-primary)',
                      minHeight: '96px',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word'
                    }}>
                      {formData.bio || <span className="text-muted">Not set</span>}
                    </div>
                  )}
                </div>

                {/* Read-only fields */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                  <h6 className="text-muted mb-3">System Information</h6>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={user?.email || profile?.email || ''} 
                      readOnly
                      style={{ background: 'var(--background)', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>User ID</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={user?.id || ''} 
                      readOnly
                      style={{ background: 'var(--background)', fontSize: '0.875rem' }}
                    />
                  </div>

                  {profile?.created_at && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>Created At</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={new Date(profile.created_at).toLocaleString()} 
                        readOnly
                        style={{ background: 'var(--background)', fontSize: '0.875rem' }}
                      />
                    </div>
                  )}

                  {profile?.updated_at && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold" style={{ color: 'var(--text-primary)' }}>Last Updated</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={new Date(profile.updated_at).toLocaleString()} 
                        readOnly
                        style={{ background: 'var(--background)', fontSize: '0.875rem' }}
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="d-flex gap-2 mt-4">
                    <button
                      onClick={handleSave}
                      className="btn btn-primary"
                      disabled={saving}
                      style={{ borderRadius: '8px', fontWeight: 600 }}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn btn-outline-secondary"
                      disabled={saving}
                      style={{ borderRadius: '8px', fontWeight: 600 }}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

