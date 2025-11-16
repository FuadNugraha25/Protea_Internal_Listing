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
        showAdminButton={user && allowedUserId.includes(user.id)}
        showTambahListingButton={true}
        user={user}
      />
      <div style={{ background: 'var(--background)', minHeight: '100vh', paddingBottom: '2rem', paddingTop: '6rem' }}>
        <div className="container mb-5" style={{ marginTop: '1rem' }}>
          <div className="d-flex mb-3 gap-2 align-items-center">
            <button 
              className="btn btn-secondary d-inline-flex align-items-center" 
              onClick={() => navigate(`/listing/${id}`)}
              style={{ borderRadius: '8px' }}
            >
              <span className="me-2" style={{fontSize: '1.2em'}}>&larr;</span> Back to Property
            </button>
          </div>
        
        {alert.message && (
          <div 
            className="position-fixed"
            style={{
              bottom: '20px',
              right: '20px',
              zIndex: 9999,
              transition: 'all 0.3s ease-in-out',
              transform: showNotification ? 'translateY(0)' : 'translateY(100px)',
              opacity: showNotification ? 1 : 0,
            }}
          >
            <div 
              className="p-3 rounded shadow-lg"
              style={{
                background: alert.severity === 'success' 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                minWidth: '300px',
                maxWidth: '400px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}
            >
              {alert.message}
            </div>
          </div>
        )}

        <div className="row justify-content-center">
          <div className="col-12 d-flex justify-content-center">
            <div className="card w-100" style={{ maxWidth: '1000px', border: 'none', boxShadow: 'var(--shadow-lg)', borderRadius: '12px' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)', border: 'none', borderRadius: '12px 12px 0 0' }}>
                <h3 className="mb-0" style={{ color: 'white', fontWeight: 600 }}>Edit Property</h3>
              </div>
              <div className="card-body" style={{ background: 'var(--surface)' }}>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Owner</label>
                    <select
                      name="owner"
                      className="form-select"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      disabled={usersLoading}
                      required
                      style={{
                        backgroundColor: usersLoading ? '#f8f9fa' : 'white',
                        cursor: usersLoading ? 'not-allowed' : 'pointer'
                      }}
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
                    <small className="text-muted">Select the owner of this listing</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input 
                      name="title" 
                      className="form-control" 
                      value={formData.title} 
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                  <textarea
                    ref={descriptionRef}
                    name="description"
                    className="form-control"
                    value={formData.description}
                    onChange={e => {
                      handleChange(e);
                      // Auto-resize
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    style={{ overflow: 'hidden', resize: 'none', minHeight: '80px' }}
                    placeholder="Enter property description"
                  />
                </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Transaction Type</label>
                      <select
                        name="transaction_type"
                        className="form-select"
                        value={formData.transaction_type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Pilih Tipe Transaksi</option>
                        <option value="Jual">Jual</option>
                        <option value="Sewa">Sewa</option>
                      </select>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Property Type</label>
                      <select
                        name="property_type"
                        className="form-select"
                        value={formData.property_type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Pilih Tipe Properti</option>
                        <option value="Rumah">Rumah</option>
                        <option value="Kavling">Kavling</option>
                        <option value="Apartemen">Apartemen</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">LT (Luas Tanah)</label>
                      <input 
                        name="lt" 
                        type="number" 
                        className="form-control" 
                        value={formData.lt} 
                        onChange={handleChange}
                        placeholder="m²"
                      />
                    </div>
                    
                    {formData.property_type !== 'Kavling' && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">LB (Luas Bangunan)</label>
                        <input 
                          name="lb" 
                          type="number" 
                          className="form-control" 
                          value={formData.lb} 
                          onChange={handleChange}
                          placeholder="m²"
                        />
                      </div>
                    )}
                  </div>
                  
                  {formData.property_type !== 'Kavling' && (
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">KT (Kamar Tidur)</label>
                        <input 
                          name="kt" 
                          type="number" 
                          className="form-control" 
                          value={formData.kt} 
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label">KM (Kamar Mandi)</label>
                        <input 
                          name="km" 
                          type="number" 
                          className="form-control" 
                          value={formData.km} 
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Province</label>
                      <div className="input-group">
                        <select
                          name="province"
                          className="form-select"
                          value={formData.province}
                          onChange={handleChange}
                          style={{ borderRight: 'none' }}
                        >
                          <option value="">Select Province</option>
                          {uniqueProvinces.map((province, index) => (
                            <option key={index} value={province}>{province}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          name="province"
                          className="form-control"
                          placeholder="Or type new province"
                          value={formData.province}
                          onChange={handleChange}
                          style={{ borderLeft: 'none' }}
                        />
                      </div>
                      {locationLoading && <small className="text-muted">Loading provinces...</small>}
                    </div>
                    
                    <div className="col-md-4 mb-3">
                      <label className="form-label">City</label>
                      <div className="input-group">
                        <select
                          name="city"
                          className="form-select"
                          value={formData.city}
                          onChange={handleChange}
                          style={{ borderRight: 'none' }}
                        >
                          <option value="">Select City</option>
                          {uniqueCities.map((city, index) => (
                            <option key={index} value={city}>{city}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          name="city"
                          className="form-control"
                          placeholder="Or type new city"
                          value={formData.city}
                          onChange={handleChange}
                          style={{ borderLeft: 'none' }}
                          required
                        />
                      </div>
                      {locationLoading && <small className="text-muted">Loading cities...</small>}
                    </div>
                    
                    <div className="col-md-4 mb-3">
                      <label className="form-label">District</label>
                      <div className="input-group">
                        <select
                          name="district"
                          className="form-select"
                          value={formData.district}
                          onChange={handleChange}
                          style={{ borderRight: 'none' }}
                        >
                          <option value="">Select District</option>
                          {uniqueDistricts.map((district, index) => (
                            <option key={index} value={district}>{district}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          name="district"
                          className="form-control"
                          placeholder="Or type new district"
                          value={formData.district}
                          onChange={handleChange}
                          style={{ borderLeft: 'none' }}
                        />
                      </div>
                      {locationLoading && <small className="text-muted">Loading districts...</small>}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Price</label>
                    <div className="d-flex align-items-center">
                      <input 
                        name="price" 
                        type="text" 
                        className="form-control" 
                        value={formatPriceWithCommas(formData.price)} 
                        onChange={handlePriceChange}
                        required
                      />
                      {formData.property_type === 'Tanah' && (
                        <span className="ms-2 text-muted">/m²</span>
                      )}
                      {formData.transaction_type === 'Sewa' && (
                        <span className="ms-2 text-muted">/Tahun</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary flex-fill" 
                      disabled={saving}
                      style={{ borderRadius: '10px', fontWeight: 600, padding: '0.75rem 1.5rem' }}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Saving...
                        </>
                      ) : (
                        'Update Property'
                      )}
                    </button>
                    
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => navigate(`/listing/${id}`)}
                      style={{ borderRadius: '10px', fontWeight: 600, padding: '0.75rem 1.5rem' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default EditPropertyForm;