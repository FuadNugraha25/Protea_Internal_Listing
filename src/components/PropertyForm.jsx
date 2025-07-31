// src/components/PropertyForm.jsx
import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import Alert from '@mui/material/Alert';

const PropertyForm = ({ user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_urls: '',
    lt: '',
    lb: '',
    kt: '',
    km: '',
    city: '',
    township: '',
    price: '',
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  // Add state for alert
  const [alert, setAlert] = useState({ message: '', severity: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = {
      ...formData,
      [name]: value,
    };

    // If description changes, try to extract LT, LB, and price
    if (name === 'description') {
      // Extract LT (e.g., LT. 84m² or Luas Tanah: 112 m²)
      let ltMatch = value.match(/LT\.?\s*(\d+)/i);
      if (!ltMatch) {
        ltMatch = value.match(/Luas\s*Tanah\s*[:：]?\s*(\d+)/i);
      }
      if (ltMatch) {
        updatedForm.lt = ltMatch[1];
      }
      // Extract LB (e.g., LB. 100m² or Luas Bangunan: 100 m²)
      let lbMatch = value.match(/LB\.?\s*(\d+)/i);
      if (!lbMatch) {
        lbMatch = value.match(/Luas\s*Bangunan\s*[:：]?\s*(\d+)/i);
      }
      if (lbMatch) {
        updatedForm.lb = lbMatch[1];
      }
      // Extract KT (e.g., KT 3+1, 3 Kamar Tidur)
      let ktMatch = value.match(/KT\.?\s*(\d+)(\s*\+\s*(\d+))?/i);
      if (!ktMatch) {
        ktMatch = value.match(/(\d+)\s*Kamar\s*Tidur/i);
      }
      if (ktMatch) {
        let kt = parseInt(ktMatch[1] || '0', 10);
        if (ktMatch[3]) {
          kt += parseInt(ktMatch[3], 10);
        }
        updatedForm.kt = kt;
      }
      // Extract KM (e.g., KM 4+1, 2 Kamar Mandi)
      let kmMatch = value.match(/KM\.?\s*(\d+)(\s*\+\s*(\d+))?/i);
      if (!kmMatch) {
        kmMatch = value.match(/(\d+)\s*Kamar\s*Mandi/i);
      }
      if (kmMatch) {
        let km = parseInt(kmMatch[1] || '0', 10);
        if (kmMatch[3]) {
          km += parseInt(kmMatch[3], 10);
        }
        updatedForm.km = km;
      }
      // Extract Harga/Price (e.g., Harga: 1.95 M, Harga: Rp 1.725 M, Harga: 2400000000)
      let priceMatch = value.match(/Harga\s*[:：]?\s*Rp?\.?\s*([\d.,]+)\s*([Mm]?)/i);
      if (!priceMatch) {
        priceMatch = value.match(/Harga\s*[:：]?\s*([\d.,]+)\s*([Mm]?)/i);
      }
      if (priceMatch) {
        let priceNum = priceMatch[1].replace(/\./g, '').replace(/,/g, '');
        if (priceMatch[2] && priceMatch[2].toLowerCase() === 'm') {
          // If 'M' is present, multiply by 1,000,000
          priceNum = String(Number(priceNum) * 1000000);
        }
        updatedForm.price = priceNum;
      }
    }
    setFormData(updatedForm);
  };

  const uploadImageToSupabase = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('house-photos')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('house-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleImageUpload = async (files) => {
    setIsUploading(true);
    try {
      // Only take the first file
      const file = files[0];
      const publicUrl = await uploadImageToSupabase(file);
      setUploadedImage(publicUrl);
      setFormData(prev => ({
        ...prev,
        image_urls: publicUrl
      }));
    } catch (error) {
      setAlert({ message: '❌ Error uploading image: ' + error.message, severity: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          handleImageUpload([file]);
          break;
        }
      }
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setFormData(prev => ({
      ...prev,
      image_urls: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
  
    // Generate a random UUID for the listing ID (primary key)
    const listingId = crypto.randomUUID();
    
    // Only include fields that exist in the database table
    const submission = {
      id: listingId,  // This is the primary key for the listing
      user_id: user.id,  // This is the foreign key to the user
      title: formData.title,
      description: formData.description,
      image_urls: formData.image_urls,
      lt: formData.lt || null,
      lb: formData.lb || null,
      kt: formData.kt || null,
      km: formData.km || null,
      city: formData.city,
      township: formData.township,
      price: formData.price || null,
    }
  
    console.log('Submitting data:', submission);
    console.log('Original formData:', formData);
  
    const { data, error } = await supabase.from('listings').insert(submission).select()
  
    if (error) {
      console.error('Supabase error details:', error);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      setAlert({ message: '❌ Error saving data: ' + error.message, severity: 'error' });
    } else {
      console.log('Success! Inserted data:', data);
      setAlert({ message: '✅ Data submitted successfully!', severity: 'success' });
      setFormData({
        title: '',
        description: '',
        image_urls: '',
        lt: '',
        lb: '',
        kt: '',
        km: '',
        city: '',
        township: '',
        price: '',
      })
      setUploadedImage(null);
    }
  }

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="col-md-6">
        <h3 className="text-center mb-4">Add Property</h3>
        {alert.message && (
          <Alert severity={alert.severity} onClose={() => setAlert({ message: '', severity: '' })} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input name="title" className="form-control" value={formData.title} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Images</label>
            <div 
              className="border border-dashed border-2 p-4 text-center"
              style={{ 
                borderStyle: 'dashed', 
                borderColor: '#ccc',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer',
                minHeight: '120px'
              }}
              onClick={() => fileInputRef.current?.click()}
              onPaste={handlePaste}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />
              {isUploading ? (
                <div>
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  Uploading image...
                </div>
              ) : (
                <div>
                  <i className="bi bi-cloud-upload fs-1 text-muted"></i>
                  <p className="mt-2 mb-0">Click to upload image or paste from clipboard</p>
                  <small className="text-muted">Supports: JPG, PNG, GIF</small>
                </div>
              )}
            </div>
            {/* Display uploaded image */}
            {uploadedImage && (
              <div className="mt-3">
                <h6>Uploaded Image:</h6>
                <div className="position-relative w-100">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded"
                    className="img-fluid"
                    style={{ width: '100%', height: 'auto', objectFit: 'contain', maxHeight: '400px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm position-absolute"
                    style={{ top: '5px', right: '5px' }}
                    onClick={removeImage}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="row">
            <div className="col">
              <label className="form-label">LT</label>
              <input name="lt" type="number" className="form-control" value={formData.lt} onChange={handleChange} />
            </div>
            <div className="col">
              <label className="form-label">LB</label>
              <input name="lb" type="number" className="form-control" value={formData.lb} onChange={handleChange} />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col">
              <label className="form-label">KT</label>
              <input name="kt" type="number" className="form-control" value={formData.kt} onChange={handleChange} />
            </div>
            <div className="col">
              <label className="form-label">KM</label>
              <input name="km" type="number" className="form-control" value={formData.km} onChange={handleChange} />
            </div>
          </div>
          <div className="mb-3 mt-3">
            <label className="form-label">City</label>
            <input name="city" className="form-control" value={formData.city} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Township</label>
            <input name="township" className="form-control" value={formData.township} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Price</label>
            <input name="price" type="number" className="form-control" value={formData.price} onChange={handleChange} />
          </div>
          <button className="btn btn-primary w-100 mb-3" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Submit'}
          </button>
          {/* <button 
            type="button" 
            className="btn btn-secondary w-100 mb-3" 
            onClick={async () => {
              console.log('Testing database connection...');
              const { data, error } = await supabase.from('listings').select('*').limit(1);
              if (error) {
                console.error('Database test error:', error);
                alert('Database test failed: ' + error.message);
              } else {
                console.log('Database test successful:', data);
                console.log('Table structure:', data.length > 0 ? Object.keys(data[0]) : 'No records');
                alert('Database connection working! Found ' + data.length + ' records');
              }
            }}
          >
            Test Database Connection
          </button> */}
          {/* <button 
            type="button" 
            className="btn btn-warning w-100 mb-3" 
            onClick={async () => {
              console.log('Testing minimal insert...');
              const testData = {
                id: crypto.randomUUID(),
                user_id: user.id,
                title: 'Test Property',
                description: 'Test description',
                image_urls: '',
                city: 'Test City',
                township: 'Test Township'
              };
              console.log('Test data:', testData);
              const { data, error } = await supabase.from('listings').insert(testData).select();
              if (error) {
                console.error('Minimal insert error:', error);
                console.error('Error code:', error.code);
                console.error('Error details:', error.details);
                console.error('Error hint:', error.hint);
                alert('Minimal insert failed: ' + error.message);
              } else {
                console.log('Minimal insert successful:', data);
                alert('Minimal insert successful!');
              }
            }}
          >
            Test Minimal Insert
          </button> */}
          {/* <button 
            type="button" 
            className="btn btn-info w-100 mb-3" 
            onClick={async () => {
              console.log('Checking current user...');
              const { data: { user }, error } = await supabase.auth.getUser();
              if (error) {
                console.error('Auth error:', error);
                alert('Auth error: ' + error.message);
              } else {
                console.log('Current user:', user);
                console.log('User ID:', user?.id);
                console.log('User email:', user?.email);
                alert('Current user: ' + (user?.email || 'Not logged in'));
              }
            }}
          >
            Check Current User
          </button> */}
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;
