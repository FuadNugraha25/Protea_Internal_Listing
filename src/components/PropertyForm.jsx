// src/components/PropertyForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Alert from '@mui/material/Alert';
import imageCompression from 'browser-image-compression';
import { getOrCreateProfile } from '../utils/profileUtils';
import CustomDropdown from './CustomDropdown';

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
  const [existingListings, setExistingListings] = useState([]);
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

  // Fetch existing listings for location dropdowns
  useEffect(() => {
    async function fetchLocations() {
      const { data } = await supabase.from('listings').select('province, city, district');
      setExistingListings(data || []);
    }
    fetchLocations();
  }, []);

  const uniqueProvinces = [...new Set(existingListings.map(l => l.province).filter(Boolean))].sort();
  const uniqueCities = [...new Set(
    existingListings
      .filter(l => !formData.province || l.province === formData.province)
      .map(l => l.city).filter(Boolean)
  )].sort();
  const uniqueDistricts = [...new Set(
    existingListings
      .filter(l => !formData.city || l.city === formData.city)
      .map(l => l.district).filter(Boolean)
  )].sort();

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

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`, {
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
    <>
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

      <div className="animate-fade-in" style={{
        minHeight: '100vh',
        padding: '7rem 1rem 4rem 1rem',
        background: 'var(--background)',
        width: '100%'
      }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              Add New Property
            </h1>
            <p className="text-secondary" style={{ fontSize: '1.1rem' }}>Create a high-quality internal property listing</p>
          </div>

        <div className="glass-card p-4 p-md-5" style={{ borderRadius: 'var(--radius-xl)' }}>
          <form onSubmit={handleSubmit}>
            {/* AI Assistant Section */}
            <div className="mb-5 position-relative">
              <div
                className="p-4 rounded-4 position-relative overflow-hidden"
                style={{
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
              >
                {/* Subtle Glow Effect */}
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '150px',
                  height: '150px',
                  background: 'var(--primary)',
                  filter: 'blur(80px)',
                  opacity: 0.15,
                  pointerEvents: 'none'
                }}></div>

                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
                    <i className="bi bi-robot fs-5"></i>
                  </div>
                  <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>AI Smart Extract</h5>
                </div>

                <p className="text-secondary small mb-3">
                  Paste property descriptions from WhatsApp or other sources. AI will automatically fill the form for you.
                </p>

                <div className="mb-3">
                  <textarea
                    className="form-control"
                    placeholder="Paste property data here..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows="3"
                    style={{ resize: 'none' }}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={callGeminiAI}
                  disabled={aiLoading}
                  style={{ borderRadius: 'var(--radius-md)' }}
                >
                  {aiLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      AI Analyzing Data...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-magic me-2"></i>
                      Extract Data with AI
                    </>
                  )}
                </button>

                {aiResponse && (
                  <div className="mt-4 animate-fade-in">
                    <div className="p-3 rounded-3" style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-primary small fw-bold uppercase">Extracted Details:</span>
                        <button
                          type="button"
                          className="btn btn-success btn-sm py-1 px-3"
                          onClick={useAIResponse}
                          style={{ fontSize: '0.8rem', borderRadius: '6px' }}
                        >
                          <i className="bi bi-check2-all me-1"></i> Apply to Form
                        </button>
                      </div>
                      <div
                        style={{
                          whiteSpace: 'pre-wrap',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          lineHeight: '1.6'
                        }}
                      >
                        {aiResponse}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-12">
                <label className="form-label">Property Title</label>
                <input
                  name="title"
                  className="form-control form-control-lg"
                  placeholder="e.g. Modern Villa with Pool in Sanur"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Property Owner</label>
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
                  >
                    {usersLoading ? (
                      <option>Loading users...</option>
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
                    className="form-control"
                    value={ownerName}
                    readOnly
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                )}
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
                  <span className="input-group-text bg-transparent border-end-0 text-muted" style={{ borderColor: 'var(--border)', paddingRight: '0' }}>Rp</span>
                  <input
                    name="price"
                    type="text"
                    className="form-control border-start-0"
                    placeholder="0"
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
                  name="description"
                  className="form-control"
                  ref={descriptionRef}
                  placeholder="Describe the property's unique features, orientation, and surroundings..."
                  value={formData.description}
                  onChange={handleChange}
                  style={{ resize: 'none', minHeight: '120px' }}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Property Photos</label>
                <div
                  className="p-5 text-center rounded-4 border-2"
                  style={{
                    borderStyle: 'dashed',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    background: 'rgba(99, 102, 241, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onPaste={handlePaste}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.02)';
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
                    <div className="py-2">
                      <div className="spinner-border text-primary mb-3" role="status"></div>
                      <h6 className="text-primary mb-0">Processing & Uploading...</h6>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-primary bg-opacity-10 d-inline-flex p-3 rounded-circle text-primary mb-3">
                        <i className="bi bi-cloud-arrow-up fs-2"></i>
                      </div>
                      <h6 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Click or drop image here</h6>
                      <p className="text-muted small mb-0">Original high-res image will be automatically compressed for speed.</p>
                    </div>
                  )}
                </div>

                {uploadedImage && (
                  <div className="mt-4 animate-fade-in">
                    <div className="d-flex justify-content-between align-items-end mb-2">
                      <span className="badge bg-success-subtle text-success">Image Uploaded Successfully</span>
                      {imageFileSize && (
                        <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                          {formatFileSize(imageFileSize)}
                          {originalFileSize && <span className="text-success ms-1">({Math.round((1 - imageFileSize / originalFileSize) * 100)}% saved)</span>}
                        </span>
                      )}
                    </div>
                    <div className="position-relative rounded-4 overflow-hidden border border-white border-opacity-10 shadow-lg">
                      <img
                        src={uploadedImage}
                        alt="Preview"
                        className="w-100"
                        style={{ height: 'auto', maxHeight: '450px', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-pill shadow"
                        style={{ margin: '12px', padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                        onClick={removeImage}
                      >
                        <i className="bi bi-trash-fill"></i> Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="col-12 mt-4">
                <div className="row g-4">
                  <div className="col-md-4">
                    <label className="form-label">Provinsi</label>
                    <CustomDropdown
                      options={uniqueProvinces}
                      value={formData.province}
                      onChange={(val) => setFormData(prev => ({ ...prev, province: val, city: '', district: '' }))}
                      placeholder="Pilih Provinsi"
                      searchable={true}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Kota / Kabupaten</label>
                    <CustomDropdown
                      options={uniqueCities}
                      value={formData.city}
                      onChange={(val) => setFormData(prev => ({ ...prev, city: val, district: '' }))}
                      placeholder="Pilih Kota"
                      searchable={true}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Kecamatan</label>
                    <CustomDropdown
                      options={uniqueDistricts}
                      value={formData.district}
                      onChange={(val) => setFormData(prev => ({ ...prev, district: val }))}
                      placeholder="Pilih Kecamatan"
                      searchable={true}
                    />
                  </div>
                </div>
              </div>

              <div className="col-12">
                <hr className="my-4 opacity-10" />
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


              <div className="col-12 pt-3">
                <button
                  className="btn btn-primary w-100 py-3 shadow-lg"
                  disabled={isUploading}
                  style={{
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {isUploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Finalizing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-plus-fill me-2"></i> Create Property Listing
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .custom-switch {
          width: 3em !important;
          height: 1.5em !important;
          cursor: pointer;
        }
        .custom-switch:checked {
          background-color: var(--primary) !important;
          border-color: var(--primary) !important;
        }
        .form-label {
          margin-bottom: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .input-group-text {
          border-color: var(--border);
          color: var(--text-muted);
        }
        hr {
          border-top-color: var(--border);
        }
        .shadow-xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  </>
  );
};

export default PropertyForm;

