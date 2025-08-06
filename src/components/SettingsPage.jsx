import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import initialLocationsData from '../data/locations.json';

const SettingsPage = ({ user }) => {
  const navigate = useNavigate();
  const [expandedProvinces, setExpandedProvinces] = useState({});
  const [expandedCities, setExpandedCities] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [locationsData, setLocationsData] = useState(initialLocationsData);
  const [newLocation, setNewLocation] = useState({
    type: 'province',
    provinceId: '',
    cityId: '',
    name: '',
    id: ''
  });

  const toggleProvince = (provinceId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedProvinces(prev => ({
      ...prev,
      [provinceId]: !prev[provinceId]
    }));
  };

  const toggleCity = (cityId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCities(prev => ({
      ...prev,
      [cityId]: !prev[cityId]
    }));
  };

  const handleAddLocation = (e) => {
    e.preventDefault();
    
    // Auto-generate ID if not provided
    let finalId = newLocation.id;
    if (!finalId) {
      if (newLocation.type === 'province') {
        // Generate next province ID
        const maxProvinceId = Math.max(...locationsData.provinces.map(p => parseInt(p.id)), 0);
        finalId = String(maxProvinceId + 1).padStart(2, '0');
      } else if (newLocation.type === 'city') {
        // Generate city ID based on province
        const province = locationsData.provinces.find(p => p.id === newLocation.provinceId);
        if (province) {
          const maxCityId = Math.max(...province.cities.map(c => parseInt(c.id)), 0);
          finalId = String(maxCityId + 1).padStart(4, '0');
        }
      } else if (newLocation.type === 'district') {
        // Generate district ID based on city
        const province = locationsData.provinces.find(p => p.id === newLocation.provinceId);
        const city = province?.cities.find(c => c.id === newLocation.cityId);
        if (city) {
          const maxDistrictId = Math.max(...city.districts.map(d => parseInt(d.id)), 0);
          finalId = String(maxDistrictId + 1).padStart(6, '0');
        }
      }
    }
    
    // Create new location object
    const newLocationObj = {
      id: finalId,
      name: newLocation.name
    };
    
    // Update the locations data based on type
    setLocationsData(prevData => {
      const newData = { ...prevData };
      
      if (newLocation.type === 'province') {
        newData.provinces.push({
          ...newLocationObj,
          cities: []
        });
      } else if (newLocation.type === 'city') {
        const provinceIndex = newData.provinces.findIndex(p => p.id === newLocation.provinceId);
        if (provinceIndex !== -1) {
          newData.provinces[provinceIndex].cities.push({
            ...newLocationObj,
            districts: []
          });
        }
      } else if (newLocation.type === 'district') {
        const provinceIndex = newData.provinces.findIndex(p => p.id === newLocation.provinceId);
        if (provinceIndex !== -1) {
          const cityIndex = newData.provinces[provinceIndex].cities.findIndex(c => c.id === newLocation.cityId);
          if (cityIndex !== -1) {
            newData.provinces[provinceIndex].cities[cityIndex].districts.push(newLocationObj);
          }
        }
      }
      
      return newData;
    });
    
    // Reset form
    setNewLocation({
      type: 'province',
      provinceId: '',
      cityId: '',
      name: '',
      id: ''
    });
    setShowAddForm(false);
    
    // Show success message
    alert(`✅ New ${newLocation.type} "${newLocation.name}" (ID: ${finalId}) has been added successfully!`);
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="col-md-8">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Location Settings</h2>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            &larr; Back
          </button>
        </div>

        {/* Add New Location Form */}
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-plus-circle me-2"></i>
              Add New Location
            </h5>
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Hide Form' : 'Show Form'}
            </button>
          </div>
          {showAddForm && (
            <div className="card-body">
              <form onSubmit={handleAddLocation}>
                <div className="row">
                  <div className="col-md-3">
                    <label className="form-label">Location Type</label>
                    <select 
                      className="form-select"
                      value={newLocation.type}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="province">Province</option>
                      <option value="city">City</option>
                      <option value="district">District</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">ID (Optional)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Auto-generated if empty"
                      value={newLocation.id}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, id: e.target.value }))}
                    />
                    <small className="text-muted">Leave empty for auto-generation</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Enter location name"
                      value={newLocation.name}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                {newLocation.type === 'city' && (
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <label className="form-label">Province</label>
                      <select 
                        className="form-select"
                        value={newLocation.provinceId}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, provinceId: e.target.value }))}
                        required
                      >
                        <option value="">Select Province</option>
                        {locationsData.provinces.map(province => (
                          <option key={province.id} value={province.id}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                
                {newLocation.type === 'district' && (
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <label className="form-label">Province</label>
                      <select 
                        className="form-select"
                        value={newLocation.provinceId}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, provinceId: e.target.value }))}
                        required
                      >
                        <option value="">Select Province</option>
                        {locationsData.provinces.map(province => (
                          <option key={province.id} value={province.id}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">City</label>
                      <select 
                        className="form-select"
                        value={newLocation.cityId}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, cityId: e.target.value }))}
                        required
                        disabled={!newLocation.provinceId}
                      >
                        <option value="">Select City</option>
                        {newLocation.provinceId && 
                          locationsData.provinces
                            .find(p => p.id === newLocation.provinceId)
                            ?.cities.map(city => (
                              <option key={city.id} value={city.id}>
                                {city.name}
                              </option>
                            ))
                        }
                      </select>
                    </div>
                  </div>
                )}
                
                <div className="mt-3">
                  <button type="submit" className="btn btn-primary me-2">
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Location
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setNewLocation({
                        type: 'province',
                        provinceId: '',
                        cityId: '',
                        name: '',
                        id: ''
                      });
                      setShowAddForm(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-geo-alt me-2"></i>
              Available Locations
            </h5>
            <small className="text-muted">
              Total: {locationsData.provinces.length} Provinces, 
              {locationsData.provinces.reduce((total, province) => total + province.cities.length, 0)} Cities, 
              {locationsData.provinces.reduce((total, province) => 
                total + province.cities.reduce((cityTotal, city) => cityTotal + city.districts.length, 0), 0
              )} Districts
            </small>
          </div>
          <div className="card-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {locationsData.provinces.map((province) => (
              <div key={province.id} className="mb-3">
                <div 
                  className="d-flex justify-content-between align-items-center p-2 border rounded"
                  style={{ 
                    backgroundColor: expandedProvinces[province.id] ? '#f8f9fa' : 'white',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => toggleProvince(province.id, e)}
                  onTouchStart={(e) => e.preventDefault()}
                >
                  <div>
                    <strong className="text-primary">{province.name}</strong>
                    <small className="text-muted ms-2">({province.cities.length} cities)</small>
                  </div>
                  <div>
                    <i className={`bi bi-chevron-${expandedProvinces[province.id] ? 'up' : 'down'}`}></i>
                  </div>
                </div>
                
                {expandedProvinces[province.id] && (
                  <div className="ms-4 mt-2">
                    {province.cities.map((city) => (
                      <div key={city.id} className="mb-2">
                        <div 
                          className="d-flex justify-content-between align-items-center p-2 border rounded"
                          style={{ 
                            backgroundColor: expandedCities[city.id] ? '#f0f0f0' : 'white',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => toggleCity(city.id, e)}
                          onTouchStart={(e) => e.preventDefault()}
                        >
                          <div>
                            <strong className="text-success">{city.name}</strong>
                            <small className="text-muted ms-2">({city.districts.length} districts)</small>
                          </div>
                          <div>
                            <i className={`bi bi-chevron-${expandedCities[city.id] ? 'up' : 'down'}`}></i>
                          </div>
                        </div>
                        
                        {expandedCities[city.id] && (
                          <div className="ms-4 mt-2">
                            <div className="row">
                              {city.districts.map((district) => (
                                <div key={district.id} className="col-md-6 col-lg-4 mb-1">
                                  <div className="p-2 border rounded bg-light">
                                    <small className="text-muted">{district.id}</small>
                                    <div className="fw-medium">{district.name}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Removed location statistics section */}
      </div>
    </div>
  );
};

export default SettingsPage;