// src/components/EditPropertyForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from './Navbar';
import { getOrCreateProfile } from '../utils/profileUtils';

const EditPropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState({ message: '', severity: '' });
  const [showNotification, setShowNotification] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [allUsers, setAllUsers] = useState([]); // Store all users for dropdown
  const [usersLoading, setUsersLoading] = useState(true);
  
  // Add state for existing location data
  const [existingListings, setExistingListings] = useState([]);
  const [locationLoading, setLocationLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lt: '',
    lb: '',
    kt: '',
    km: '',
    province: '',
    city: '',
    district: '',
    price: '',
    transaction_type: '',
    property_type: '',
  });

  const allowedUserId = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136'];

  useEffect(() => {
    // Check if user is admin
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (!user || !allowedUserId.includes(user.id)) {
        setAlert({ message: '❌ Access denied. Admin privileges required.', severity: 'error' });
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }
      fetchListingData();
    });
  }, [id, navigate]);

  // Fetch all users/profiles for owner dropdown
  useEffect(() => {
    async function fetchAllUsers() {
      setUsersLoading(true);
      try {
        // Fetch all profiles from the database
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, full_name, email')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching users:', error);
          setAllUsers([]);
        } else {
          // Map profiles to a format suitable for dropdown
          const usersList = (data || []).map(profile => ({
            id: profile.id,
            name: profile.name || profile.full_name || profile.email || 'Unknown User',
            email: profile.email || ''
          }));
          setAllUsers(usersList);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setAllUsers([]);
      } finally {
        setUsersLoading(false);
      }
    }
    fetchAllUsers();
  }, []);

  // Fetch existing listings for dropdown data
  useEffect(() => {
    async function fetchExistingListings() {
      setLocationLoading(true);
      try {
        const { data, error } = await supabase.from("listings").select('province, city, district');
        if (error) {
          console.error('Error fetching existing listings:', error);
        } else {
          setExistingListings(data || []);
        }
      } catch (error) {
        console.error('Error fetching existing listings:', error);
      } finally {
        setLocationLoading(false);
      }
    }
    fetchExistingListings();
  }, []);

  // Extract unique values for dropdowns
  const uniqueProvinces = [...new Set(existingListings.map(listing => listing.province).filter(Boolean))].sort();
  const uniqueCities = [...new Set(existingListings.map(listing => listing.city).filter(Boolean))].sort();
  const uniqueDistricts = [...new Set(existingListings.map(listing => listing.district).filter(Boolean))].sort();

  const fetchListingData = async () => {
    try {
      const { data, error } = await supabase
        .from("listings")
        .select()
        .eq("id", id)
        .single();

      if (error || !data) {
        setAlert({ message: '❌ Property not found', severity: 'error' });
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }

      // Autofill form with existing data
      setFormData({
        title: data.title || '',
        description: data.description || '',
        lt: data.lt || '',
        lb: data.lb || '',
        kt: data.kt || '',
        km: data.km || '',
        province: data.province || '',
        city: data.city || '',
        district: data.district || '',
        price: data.price || '',
        transaction_type: data.transaction_type || '',
        property_type: data.property_type || '',
      });

      // Set owner name from listing data if it exists, otherwise fetch from profile
      // This will be used to set the default selected value in the dropdown
      if (data.owner) {
        setOwnerName(data.owner);
      } else if (data.user_id) {
        try {
          // First try to get profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, name, full_name, email')
            .eq('id', data.user_id)
            .single();

          if (!profileError && profile) {
            const name = profile.name || profile.full_name || profile.email || 'Unknown User';
            setOwnerName(name);
          } else {
            // Profile doesn't exist, try to create it if it's the current user
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser && currentUser.id === data.user_id) {
              const createdProfile = await getOrCreateProfile(currentUser);
              if (createdProfile) {
                const name = createdProfile.name || createdProfile.full_name || createdProfile.email || 'Unknown User';
                setOwnerName(name);
              } else {
                setOwnerName('Unknown User');
              }
            } else {
              setOwnerName('Unknown User');
            }
          }
        } catch (error) {
          console.error('Error fetching owner name:', error);
          setOwnerName('Unknown User');
        }
      } else {
        setOwnerName('Unknown User');
      }
    } catch (error) {
      setAlert({ message: '❌ Error loading property data: ' + error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (alert.message) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
        setTimeout(() => {
          setAlert({ message: '', severity: '' });
        }, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert.message]);

  const formatPriceWithCommas = (value) => {
    if (!value) return '';
    const numericValue = value.toString().replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handlePriceChange = (e) => {
    const { value } = e.target;
    const numericValue = value.replace(/\D/g, '');
    setFormData(prev => ({
      ...prev,
      price: numericValue
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare update data (excluding image_urls as requested)
      const updateData = {
        title: formData.title,
        description: formData.description,
        owner: ownerName || 'Unknown User',  // Include owner name
        lt: formData.lt || null,
        lb: formData.lb || null,
        kt: formData.kt || null,
        km: formData.km || null,
        province: formData.province,
        city: formData.city,
        district: formData.district,
        price: formData.price || null,
        transaction_type: formData.transaction_type,
        property_type: formData.property_type,
      };

      const { error } = await supabase
        .from('listings')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Update error:', error);
        setAlert({ message: '❌ Error updating property: ' + error.message, severity: 'error' });
      } else {
        setAlert({ message: '✅ Property updated successfully!', severity: 'success' });
        setTimeout(() => {
          navigate(`/listing/${id}`);
        }, 1500);
      }
    } catch (error) {
      setAlert({ message: '❌ Error updating property: ' + error.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const descriptionRef = useRef(null);

  // Auto-expand description textarea on mount and when description changes
  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto';
      descriptionRef.current.style.height = descriptionRef.current.scrollHeight + 'px';
    }
  }, [formData.description]);

  if (loading) {
    return (
      <>
        <Navbar 
          title="Edit Property" 
          showAdminButton={user && allowedUserId.includes(user.id)}
          showTestingButton={user && allowedUserId.includes(user.id)}
          showTambahListingButton={true}
          showListingPribadiButton={true}
          user={user}
        />
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', paddingTop: '6rem', background: 'var(--background)' }}>
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
        title="Edit Property" 
        showDashboardButton={true}
        showAdminButton={user && allowedUserId.includes(user.id)}
        showTambahListingButton={true}
        showListingPribadiButton={true}
        user={user}
      />
      <div className="animate-fade-in" style={{ 
        minHeight: '100vh', 
        padding: '7rem 1rem 4rem 1rem', 
        background: 'var(--background)',
        width: '100%' 
      }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
              <h1 className="display-5 fw-bold mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                Edit Property
              </h1>
              <p className="text-secondary" style={{ fontSize: '1.1rem' }}>Updating listing details for consistency</p>
            </div>
            <button 
              className="btn btn-outline-secondary d-inline-flex align-items-center" 
              onClick={() => navigate(`/listing/${id}`)}
              style={{ padding: '0.75rem 1.25rem' }}
            >
              <i className="bi bi-arrow-left me-2"></i> Back to Listing
            </button>
          </div>
        
          {alert.message && (
            <div 
              className="position-fixed"
              style={{
                bottom: '30px',
                right: '30px',
                zIndex: 9999,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: showNotification ? 'translateX(0)' : 'translateX(120%)',
                opacity: showNotification ? 1 : 0,
              }}
            >
              <div 
                className="p-4 rounded-4 shadow-xl glass"
                style={{
                  background: alert.severity === 'success' 
                    ? 'rgba(16, 185, 129, 0.15)' 
                    : 'rgba(239, 68, 68, 0.15)',
                  borderLeft: `4px solid ${alert.severity === 'success' ? 'var(--success)' : 'var(--danger)'}`,
                  color: 'var(--text-primary)',
                  minWidth: '320px',
                  maxWidth: '450px',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <i className={`bi ${alert.severity === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger'} fs-4`}></i>
                  <div>
                    <div className="fw-bold mb-1">{alert.severity === 'success' ? 'Success' : 'Notification'}</div>
                    <div className="small opacity-90">{alert.message}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="glass-card p-4 p-md-5" style={{ borderRadius: 'var(--radius-xl)' }}>
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-12">
                  <label className="form-label">Property Title</label>
                  <input 
                    name="title" 
                    className="form-control form-control-lg" 
                    value={formData.title} 
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Property Owner</label>
                  <select
                    name="owner"
                    className="form-select"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    disabled={usersLoading}
                    required
                  >
                    {usersLoading ? (
                      <option>Loading users...</option>
                    ) : (
                      <>
                        <option value="">Select Owner</option>
                        {allUsers.map((user) => (
                          <option key={user.id} value={user.name}>
                            {user.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Property Type</label>
                  <select
                    name="property_type"
                    className="form-select"
                    value={formData.property_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Rumah">Rumah</option>
                    <option value="Kavling">Kavling</option>
                    <option value="Apartemen">Apartemen</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Transaction Type</label>
                  <select
                    name="transaction_type"
                    className="form-select"
                    value={formData.transaction_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Transaction</option>
                    <option value="Jual">Jual</option>
                    <option value="Sewa">Sewa</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Price (IDR)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0 text-muted" style={{ borderColor: 'var(--border)' }}>Rp</span>
                    <input 
                      name="price" 
                      type="text" 
                      className="form-control border-start-0 ps-0" 
                      value={formatPriceWithCommas(formData.price)} 
                      onChange={handlePriceChange}
                      required
                    />
                    {(formData.property_type === 'Kavling' || formData.transaction_type === 'Sewa') && (
                      <span className="input-group-text bg-transparent text-muted small" style={{ borderColor: 'var(--border)' }}>
                        {formData.property_type === 'Kavling' ? '/m²' : '/Thn'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    ref={descriptionRef}
                    name="description"
                    className="form-control"
                    value={formData.description}
                    onChange={e => {
                      handleChange(e);
                    }}
                    style={{ overflow: 'hidden', resize: 'none', minHeight: '120px' }}
                    placeholder="Enter property description"
                  />
                </div>

                <div className="col-12 mt-5">
                  <h6 className="text-primary fw-bold mb-4 d-flex align-items-center gap-2">
                    <i className="bi bi-geo-alt fs-5"></i> Location Details
                  </h6>
                  <div className="row g-4">
                    <div className="col-md-4">
                      <label className="form-label">Province</label>
                      <div className="input-group">
                        <input
                          list="provinces-list"
                          name="province"
                          className="form-control"
                          placeholder="Type province..."
                          value={formData.province}
                          onChange={handleChange}
                        />
                        <datalist id="provinces-list">
                          {uniqueProvinces.map((province, index) => (
                            <option key={index} value={province} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <label className="form-label">City</label>
                      <div className="input-group">
                        <input
                          list="cities-list"
                          name="city"
                          className="form-control"
                          placeholder="Type city..."
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                        <datalist id="cities-list">
                          {uniqueCities.map((city, index) => (
                            <option key={index} value={city} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <label className="form-label">District</label>
                      <div className="input-group">
                        <input
                          list="districts-list"
                          name="district"
                          className="form-control"
                          placeholder="Type district..."
                          value={formData.district}
                          onChange={handleChange}
                        />
                        <datalist id="districts-list">
                          {uniqueDistricts.map((district, index) => (
                            <option key={index} value={district} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                  </div>
                  {locationLoading && <small className="text-muted mt-2 d-block">Loading existing location data...</small>}
                </div>

                <div className="col-12 mt-5">
                  <h6 className="text-primary fw-bold mb-4 d-flex align-items-center gap-2">
                    <i className="bi bi-building-gear fs-5"></i> Specification Details
                  </h6>
                  <div className="row g-4">
                    <div className="col-md-3">
                      <label className="form-label">LT (m²)</label>
                      <input name="lt" type="number" className="form-control" placeholder="0" value={formData.lt} onChange={handleChange} />
                    </div>
                    {formData.property_type !== 'Kavling' && (
                      <>
                        <div className="col-md-3">
                          <label className="form-label">LB (m²)</label>
                          <input name="lb" type="number" className="form-control" placeholder="0" value={formData.lb} onChange={handleChange} />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">KT (Bed)</label>
                          <input name="kt" type="number" className="form-control" placeholder="0" value={formData.kt} onChange={handleChange} />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">KM (Bath)</label>
                          <input name="km" type="number" className="form-control" placeholder="0" value={formData.km} onChange={handleChange} />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="col-12 mt-5">
                  <div className="d-flex gap-3">
                    <button 
                      type="submit" 
                      className="btn btn-primary flex-fill py-3 shadow-lg" 
                      disabled={saving}
                      style={{ 
                        borderRadius: '12px', 
                        fontWeight: 600, 
                        fontSize: '1.1rem',
                        background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
                        border: 'none'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save2-fill me-2"></i> Update Property Listing
                        </>
                      )}
                    </button>
                    
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary px-5" 
                      onClick={() => navigate(`/listing/${id}`)}
                      style={{ borderRadius: '12px', fontWeight: 600 }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .form-label {
          margin-bottom: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .input-group-text {
          border-color: var(--border);
          color: var(--text-muted);
        }
        .shadow-xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
        }
        .form-control:focus, .form-select:focus {
           background: var(--surface-hover);
        }
      `}</style>
    </>
  );
};

export default EditPropertyForm;