// src/components/PropertyForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Alert from '@mui/material/Alert';
import imageCompression from 'browser-image-compression';
import { getOrCreateProfile } from '../utils/profileUtils';

const PropertyForm = ({ user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_urls: '',
    lt: '',
    lb: '',
    kt: '',
    km: '',
    district: '',
    city: '',
    province: '',
    price: '',
    transaction_type: '',
    property_type: '',
    has_full_interior_photos: false,
    has_tiktok_video: false,
    has_youtube_video: false,
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageFileSize, setImageFileSize] = useState(null);
  const [originalFileSize, setOriginalFileSize] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  // Add state for alert
  const [alert, setAlert] = useState({ message: '', severity: '' });
  const [showNotification, setShowNotification] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [allUsers, setAllUsers] = useState([]); // Store all users for dropdown
  const [usersLoading, setUsersLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const descriptionRef = useRef(null);

  // Admin user IDs
  const allowedUserId = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136'];

  useEffect(() => {
    if (alert.message) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
        setTimeout(() => {
          setAlert({ message: '', severity: '' });
        }, 300); // Wait for fade out animation
      }, 3000); // Auto close after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [alert.message]);

  // Check if user is admin
  useEffect(() => {
    if (user) {
      setIsAdmin(allowedUserId.includes(user.id));
    }
  }, [user]);

  // Fetch all users/profiles for owner dropdown (admin only)
  useEffect(() => {
    async function fetchAllUsers() {
      if (!isAdmin) {
        setUsersLoading(false);
        return;
      }

      setUsersLoading(true);
      try {
        // Fetch all profiles from the database
        // Try without order first to see if that's causing issues
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, full_name, email');

        if (error) {
          console.error('Error fetching users:', error);
          console.error('Error details:', error.message, error.details);
          setAllUsers([]);
        } else {
          console.log('Fetched users from database:', data);
          console.log('Number of users fetched:', data?.length || 0);
          
          // Map profiles to a format suitable for dropdown
          const usersList = (data || []).map(profile => {
            const name = profile.name || profile.full_name || profile.email || 'Unknown User';
            return {
              id: profile.id,
              name: name,
              email: profile.email || ''
            };
          });
          
          // Sort by name alphabetically
          usersList.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
          });
          
          console.log('Mapped and sorted users list:', usersList);
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
  }, [isAdmin]);

  // Fetch owner name (current user's profile) when not admin
  useEffect(() => {
    async function fetchOwnerName() {
      if (!user) {
        setOwnerName('');
        setSelectedOwnerId(null);
        return;
      }

      // Admin will choose owner from dropdown, reset defaults
      if (isAdmin) {
        setOwnerName('');
        setSelectedOwnerId('');
        return;
      }
      
      try {
        const profile = await getOrCreateProfile(user);
        if (profile) {
          const name = profile.name || profile.full_name || profile.email || 'Unknown User';
          setOwnerName(name);
        } else {
          setOwnerName(user.email || 'Unknown User');
        }
      } catch (error) {
        console.error('Error fetching owner name:', error);
        setOwnerName(user.email || 'Unknown User');
      } finally {
        setSelectedOwnerId(user.id);
      }
    }
    
    fetchOwnerName();
  }, [user, isAdmin]);

  useEffect(() => {
    if (descriptionRef.current) {
      const textarea = descriptionRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [formData.description]);

  const formatPriceWithCommas = (value) => {
    // Remove all non-digit characters
    const numericValue = value.toString().replace(/\D/g, '');
    // Add commas every 3 digits from the right
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handlePriceChange = (e) => {
    const { value } = e.target;
    // Remove commas and non-digit characters for storage
    const numericValue = value.replace(/\D/g, '');
    // Update form data with numeric value
    setFormData(prev => ({
      ...prev,
      price: numericValue
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedForm);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
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
      
      // Store original file size
      setOriginalFileSize(file.size);
      
      // Compress image options
      const options = {
        maxSizeMB: 1, // Maximum size in MB (1MB)
        maxWidthOrHeight: 1920, // Maximum width or height
        useWebWorker: true, // Use web worker for better performance
        fileType: file.type, // Keep original file type
      };
      
      // Compress the image
      const compressedFile = await imageCompression(file, options);
      
      // Store compressed file size
      setImageFileSize(compressedFile.size);
      
      // Upload compressed image
      const publicUrl = await uploadImageToSupabase(compressedFile);
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
    setImageFileSize(null);
    setOriginalFileSize(null);
    setFormData(prev => ({
      ...prev,
      image_urls: ''
    }));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const callGeminiAI = async () => {
    if (!aiPrompt.trim()) {
      setAlert({ message: '❌ Please enter a prompt for AI assistance', severity: 'error' });
      return;
    }

    setAiLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a real estate data extractor. Extract ONLY the following information from the provided property data:

LT (Luas Tanah): [extract land area in m²]
LB (Luas Bangunan): [extract building area in m²] 
KT (Kamar Tidur): [extract number of bedrooms, if format is "X+Y" then add them together]
KM (Kamar Mandi): [extract number of bathrooms, if format is "X+Y" then add them together]
Price: [extract price in Indonesian Rupiah]
Property Type: [determine if this is "Rumah" or "Kavling"]
Transaction Type: [determine if this is "Jual" or "Sewa"]

Format your response exactly like this:
LT: [number] m²
LB: [number] m²
KT: [total number]
KM: [total number]
Price: Rp [amount]
Property Type: [Rumah or Kavling]
Transaction Type: [Jual or Sewa]

IMPORTANT RULES:
1. For KT and KM, if you see format like "5+1" or "3+1", add the numbers together. 
   Example: "5+1" should become "6", "3+1" should become "4".

2. For Property Type detection:
   - If the data mentions bedrooms (KT), bathrooms (KM), kitchen (dapur), garage (garasi), carport, or building area (LB), classify as "Rumah"
   - If the data only mentions land area (LT) and mentions "tanah", "kavling", "investasi", "dibangun", or lacks building details, classify as "Kavling"
   - If data has both LT and LB with building details, it's "Rumah"
   - If data only has LT and mentions "tanah" or "kavling", it's "Kavling"

3. For Transaction Type detection:
   - If the data mentions "harga sewa", "sewa", "/tahun", "/bulan", "per tahun", "per bulan", classify as "Sewa"
   - If the data mentions "harga jual", "jual", "dijual", "for sale", or no rental keywords, classify as "Jual"
   - Default to "Jual" if no clear rental indicators are found

If any information is not available, write "Not specified" for that field.

Property data: ${aiPrompt}`
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP ${response.status}: ${errorData.error?.message || 'API request failed'}`);
      }

      const data = await response.json();
      console.log('AI Response:', data); // Debug log
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        const aiText = data.candidates[0].content.parts[0].text;
        setAiResponse(aiText);
        setAlert({ message: '✅ AI response generated successfully!', severity: 'success' });
      } else if (data.error) {
        throw new Error(data.error.message || 'AI service error');
      } else {
        console.error('Unexpected API response:', data);
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      console.error('AI Error:', error);
      if (error.message.includes('fetch')) {
        setAlert({ message: '❌ Network error. Please check your internet connection.', severity: 'error' });
      } else {
        setAlert({ message: '❌ Error calling AI service: ' + error.message, severity: 'error' });
      }
    } finally {
      setAiLoading(false);
    }
  };

  const useAIResponse = () => {
    if (aiResponse) {
      // Parse AI response to extract form data
      const lines = aiResponse.split('\n');
      const extractedData = {};
      
      lines.forEach(line => {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key && value && value !== 'Not specified') {
          switch (key) {
            case 'LT':
              extractedData.lt = value.replace(' m²', '');
              break;
            case 'LB':
              extractedData.lb = value.replace(' m²', '');
              break;
            case 'KT':
              // Handle addition if value contains "+"
              if (value.includes('+')) {
                const numbers = value.split('+').map(n => parseInt(n.trim()) || 0);
                extractedData.kt = numbers.reduce((sum, num) => sum + num, 0).toString();
              } else {
                extractedData.kt = value;
              }
              break;
            case 'KM':
              // Handle addition if value contains "+"
              if (value.includes('+')) {
                const numbers = value.split('+').map(n => parseInt(n.trim()) || 0);
                extractedData.km = numbers.reduce((sum, num) => sum + num, 0).toString();
              } else {
                extractedData.km = value;
              }
              break;
            case 'Price':
              extractedData.price = value.replace('Rp ', '').replace(/\./g, '');
              break;
            case 'Property Type':
              extractedData.property_type = value;
              break;
            case 'Transaction Type':
              extractedData.transaction_type = value;
              break;
          }
        }
      });
      
      // Update form data with extracted values
      setFormData(prev => ({
        ...prev,
        ...extractedData,
        description: aiPrompt
      }));
      
      setAlert({ message: '✅ AI extracted data applied to form fields!', severity: 'success' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
  
    // Ensure user profile exists before creating listing
    if (user) {
      try {
        await getOrCreateProfile(user);
      } catch (error) {
        console.error('Error ensuring profile exists:', error);
        // Continue anyway, profile creation is not critical for listing creation
      }
    }
  
    // Generate a random UUID for the listing ID (primary key)
    const listingId = crypto.randomUUID();
    
    // Helper function to convert string to number or null
    const convertToNumberOrNull = (value) => {
      if (!value || value === '' || value === 'Not specified') return null;
      const num = parseInt(value);
      return isNaN(num) ? null : num;
    };

    // Helper function to convert price string to number or null
    const convertPriceToNumberOrNull = (value) => {
      if (!value || value === '' || value === 'Not specified') return null;
      // Remove all non-digit characters and convert to number
      const cleanValue = value.toString().replace(/[^\d]/g, '');
      const num = parseInt(cleanValue);
      return isNaN(num) ? null : num;
    };

    // Helper function to convert price string to string (for large numbers)
    const convertPriceToStringOrNull = (value) => {
      if (!value || value === '' || value === 'Not specified') return null;
      // Remove all non-digit characters and return as string
      const cleanValue = value.toString().replace(/[^\d]/g, '');
      return cleanValue === '' ? null : cleanValue;
    };

    const ownerIdForSubmission = isAdmin ? selectedOwnerId : user?.id;

    if (!ownerIdForSubmission) {
      setAlert({ message: '❌ Please select an owner before submitting.', severity: 'error' });
      return;
    }

    // Only include fields that exist in the database table
    const submission = {
      id: listingId,  // This is the primary key for the listing
      user_id: ownerIdForSubmission,  // This is the foreign key to the user
      owner: ownerName || user?.email || 'Unknown User',  // Owner name for easy display
      title: formData.title,
      description: formData.description,
      image_urls: formData.image_urls,
      lt: convertToNumberOrNull(formData.lt),
      lb: convertToNumberOrNull(formData.lb),
      kt: convertToNumberOrNull(formData.kt),
      km: convertToNumberOrNull(formData.km),
      district: formData.district,
      city: formData.city,
      province: formData.province,
      price: convertPriceToStringOrNull(formData.price),
      transaction_type: formData.transaction_type,
      property_type: formData.property_type,
      has_full_interior_photos: formData.has_full_interior_photos,
      has_tiktok_video: formData.has_tiktok_video,
      has_youtube_video: formData.has_youtube_video,
    }
  
    console.log('Submitting data:', submission);
    console.log('Original formData:', formData);
    console.log('Price conversion:', {
      original: formData.price,
      converted: convertPriceToNumberOrNull(formData.price)
    });
  
    const { data, error } = await supabase.from('listings').insert(submission).select()
  
    if (error) {
      console.error('Supabase error details:', error);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      setAlert({ message: '❌ Error saving data: ' + error.message, severity: 'error' });
    } else {
      console.log('Success! Inserted data:', data);
      setAlert({ message: 'Data submitted successfully!', severity: 'success' });
      setFormData({
        title: '',
        description: '',
        image_urls: '',
        lt: '',
        lb: '',
        kt: '',
        km: '',
        district: '',
        city: '',
        province: '',
        price: '',
        transaction_type: '',
        property_type: '',
        has_full_interior_photos: false,
        has_tiktok_video: false,
        has_youtube_video: false,
      })
      setUploadedImage(null);
      if (isAdmin) {
        setSelectedOwnerId('');
        setOwnerName('');
      } else {
        setSelectedOwnerId(user?.id || null);
      }
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '3rem 0 2rem 0', marginTop: isAdmin ? '0' : '5rem', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', width: '100%' }}>
      <div className="container d-flex justify-content-center align-items-center" style={{ padding: '0 1rem' }}>
        <div className="col-md-8 col-lg-6">
        <div className="text-center mb-4">
          <h3 className="fw-bold mb-2" style={{ color: 'var(--text-primary)', fontSize: '2rem' }}>Add Property</h3>
          <p className="text-muted">Create a new property listing</p>
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
        <form onSubmit={handleSubmit}>
          {/* AI Assistant Section */}
          <div className="mb-4">
            <div className="card" style={{ border: 'none', boxShadow: 'var(--shadow-lg)' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
                <h6 className="mb-0" style={{ color: 'white', fontWeight: 600 }}>
                  <i className="bi bi-robot me-2"></i>
                  AI Assistant
                </h6>
              </div>
              <div className="card-body" style={{ background: 'var(--surface)' }}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Ask AI for help:</label>
                  <div className="input-group">
                    <textarea
                      className="form-control"
                      placeholder="Paste property data here to extract LT, LB, KT, KM, and Price automatically"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows="2"
                      style={{ resize: 'vertical', minHeight: '60px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={callGeminiAI}
                      disabled={aiLoading}
                      style={{ minWidth: '100px' }}
                    >
                      {aiLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          AI Thinking...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-magic me-2"></i>
                          Ask AI
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {aiResponse && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">AI Response:</label>
                    <div className="border rounded p-3" style={{ 
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '8px'
                    }}>
                      <div 
                        className="mb-3"
                        style={{
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word',
                          maxHeight: '300px',
                          overflowY: 'auto',
                          lineHeight: '1.5',
                          fontSize: '14px',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {aiResponse}
                      </div>
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={useAIResponse}
                        style={{ borderRadius: '8px' }}
                      >
                        <i className="bi bi-check-circle me-2"></i>
                        Use This Response
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Owner</label>
            {isAdmin ? (
              <select
                name="owner"
                className="form-select"
                value={selectedOwnerId || ''}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setSelectedOwnerId(selectedId);
                  if (!selectedId) {
                    setOwnerName('');
                    return;
                  }
                  const selectedUser = allUsers.find((userOption) => userOption.id === selectedId);
                  setOwnerName(selectedUser?.name || 'Unknown User');
                }}
                disabled={usersLoading}
                required
                style={{
                  backgroundColor: usersLoading ? '#f8f9fa' : 'white',
                  cursor: usersLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {usersLoading ? (
                  <option>Loading users...</option>
                ) : allUsers.length === 0 ? (
                  <option value="">No users found</option>
                ) : (
                  <>
                    <option value="">Select Owner</option>
                    {allUsers.map((userOption) => (
                      <option key={userOption.id} value={userOption.id}>
                        {userOption.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            ) : (
              <input 
                name="owner" 
                className="form-control" 
                value={ownerName} 
                readOnly 
                disabled
                style={{ 
                  backgroundColor: '#f8f9fa', 
                  cursor: 'not-allowed',
                  color: '#6c757d'
                }}
              />
            )}
            <small className="text-muted">
              {isAdmin ? 'Select the owner of this listing' : 'This listing will be associated with your account'}
            </small>
          </div>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input name="title" className="form-control" value={formData.title} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-control"
              ref={descriptionRef}
              value={formData.description}
              onChange={handleChange}
              style={{ resize: 'none', overflow: 'hidden' }}
              rows="3"
            />
          </div>
          <div className="mb-3">
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
          <div className="mb-3">
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
          <div className="mb-3">
            <label className="form-label">Images</label>
            <div 
              className="border border-dashed border-2 p-4 text-center rounded"
              style={{ 
                borderStyle: 'dashed', 
                borderColor: 'var(--primary-color)',
                backgroundColor: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                cursor: 'pointer',
                minHeight: '120px',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                borderWidth: '2px'
              }}
              onClick={() => fileInputRef.current?.click()}
              onPaste={handlePaste}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-dark)';
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.transform = 'scale(1.01)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)';
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.transform = 'scale(1)';
              }}
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
                  <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Uploading image...</span>
                </div>
              ) : (
                <div>
                  <i className="bi bi-cloud-upload fs-1" style={{ color: 'var(--primary-color)' }}></i>
                  <p className="mt-2 mb-0" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Click to upload image or paste from clipboard</p>
                  <small className="text-muted">Supports: JPG, PNG, GIF</small>
                </div>
              )}
            </div>
            {/* Display uploaded image */}
            {uploadedImage && (
              <div className="mt-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h6 style={{ color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>Uploaded Image:</h6>
                  {imageFileSize && (
                    <small style={{ color: '#767676', fontSize: '0.875rem' }}>
                      Size: {formatFileSize(imageFileSize)}
                      {originalFileSize && originalFileSize > imageFileSize && (
                        <span style={{ color: '#28a745', marginLeft: '0.5rem' }}>
                          (compressed from {formatFileSize(originalFileSize)})
                        </span>
                      )}
                    </small>
                  )}
                </div>
                <div className="position-relative w-100 rounded overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded"
                    className="img-fluid"
                    style={{ width: '100%', height: 'auto', objectFit: 'contain', maxHeight: '400px', display: 'block' }}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm position-absolute"
                    style={{ 
                      top: '10px', 
                      right: '10px',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      boxShadow: 'var(--shadow-md)'
                    }}
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
              {formData.property_type === 'Kavling' && (
                <small className="text-muted">Total Luas</small>
              )}
            </div>
            {formData.property_type !== 'Kavling' && (
              <div className="col">
                <label className="form-label">LB</label>
                <input name="lb" type="number" className="form-control" value={formData.lb} onChange={handleChange} />
              </div>
            )}
          </div>
          {formData.property_type !== 'Kavling' && (
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
          )}
          <div className="mb-3 mt-3">
            <label className="form-label">District</label>
            <input name="district" className="form-control" value={formData.district} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">City</label>
            <input name="city" className="form-control" value={formData.city} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Province</label>
            <input name="province" className="form-control" value={formData.province} onChange={handleChange} />
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
              />
              {formData.property_type === 'Kavling' && (
                <span className="ms-2 text-muted">/m²</span>
              )}
              {formData.transaction_type === 'Sewa' && (
                <span className="ms-2 text-muted">/Tahun</span>
              )}
            </div>
          </div>
          <div className="mb-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="dummyCheckbox1"
                name="has_full_interior_photos"
                checked={formData.has_full_interior_photos}
                onChange={handleCheckboxChange}
              />
              <label className="form-check-label" htmlFor="dummyCheckbox1">
                Foto dalam lengkap
              </label>
            </div>
            <div className="form-check mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="dummyCheckbox2"
                name="has_tiktok_video"
                checked={formData.has_tiktok_video}
                onChange={handleCheckboxChange}
              />
              <label className="form-check-label" htmlFor="dummyCheckbox2">
                Video Tiktok
              </label>
            </div>
            <div className="form-check mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="dummyCheckbox3"
                name="has_youtube_video"
                checked={formData.has_youtube_video}
                onChange={handleCheckboxChange}
              />
              <label className="form-check-label" htmlFor="dummyCheckbox3">
                Video Youtube
              </label>
            </div>
          </div>
          <button className="btn btn-primary w-100 mb-3" disabled={isUploading} style={{ 
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: '10px'
          }}>
            {isUploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Uploading...
              </>
            ) : (
              'Submit'
            )}
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
                province: 'Test Province'
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
    </div>
  );
};

export default PropertyForm;

