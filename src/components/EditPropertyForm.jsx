// src/components/EditPropertyForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from './Navbar';

const EditPropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState({ message: '', severity: '' });
  const [showNotification, setShowNotification] = useState(false);
  
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

  if (loading) {
    return (
      <>
        <Navbar title="Edit Property" showAdminButton={user && allowedUserId.includes(user.id)} />
        <div className="container mt-4 d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar title="Edit Property" showAdminButton={user && allowedUserId.includes(user.id)} />
      <div className="container mt-4 mb-5">
        <div className="d-flex mb-3 gap-2 align-items-center">
          <button className="btn btn-secondary d-inline-flex align-items-center" onClick={() => navigate(`/listing/${id}`)}>
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
                backgroundColor: alert.severity === 'success' ? '#10b981' : '#ef4444',
                color: 'white',
                minWidth: '300px',
                maxWidth: '400px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {alert.message}
            </div>
          </div>
        )}

        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h3 className="mb-0">Edit Property</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
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
                      name="description" 
                      className="form-control" 
                      value={formData.description} 
                      onChange={handleChange}
                      rows="4"
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
                      <input 
                        name="province" 
                        className="form-control" 
                        value={formData.province} 
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="col-md-4 mb-3">
                      <label className="form-label">City</label>
                      <input 
                        name="city" 
                        className="form-control" 
                        value={formData.city} 
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="col-md-4 mb-3">
                      <label className="form-label">District</label>
                      <input 
                        name="district" 
                        className="form-control" 
                        value={formData.district} 
                        onChange={handleChange}
                      />
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
    </>
  );
};

export default EditPropertyForm;