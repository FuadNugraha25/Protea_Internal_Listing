import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Navbar = ({ showAdminButton = false, showDashboardButton = false, showTestingButton = false, showTambahListingButton = false, user = null, onLogout }) => {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Default profile picture (black silhouette)
  const defaultProfilePicture = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='35' r='20' fill='%23000'/%3E%3Cpath d='M 20 70 Q 20 55 50 55 Q 80 55 80 70 L 80 100 L 20 100 Z' fill='%23000'/%3E%3C/svg%3E";
  
  // Check if user is admin
  const allowedUserIds = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136'];
  const isAdmin = user && allowedUserIds.includes(user.id);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (onLogout) onLogout();
    navigate('/');
  };

  const goToAdmin = () => {
    navigate('/admin');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const goToTesting = () => {
    navigate('/testing');
  };

  const goToTambahListing = () => {
    navigate('/tambah-listing');
  };

  const goToProfile = () => {
    setShowProfileDropdown(false);
    navigate('/profile');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const buttonStyle = {
    fontWeight: 600, 
    letterSpacing: '0.01em',
    color: 'var(--text-primary)',
    borderColor: 'var(--border-color)',
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
    borderRadius: '8px',
    padding: '0.5rem 1rem'
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: 'var(--primary-color)',
    color: '#fff',
    borderColor: 'var(--primary-color)',
    transform: 'translateY(-1px)',
    boxShadow: 'var(--shadow-md)'
  };

  return (
    <nav style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'var(--surface)', 
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      padding: '1rem 2rem', 
      borderBottom: '1px solid var(--border-color)',
      fontSize: '1.1rem',
      zIndex: 1000,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ 
        textAlign: 'left', 
        padding: '0.5rem 0', 
        fontWeight: 700, 
        letterSpacing: '0.05em',
        display: 'inline-block',
        color: 'var(--text-primary)',
        fontSize: '1.25rem'
      }}>
        Protea Realty
      </div>
      <div style={{ 
        float: 'right', 
        display: 'flex', 
        gap: '0.5rem',
        marginTop: '0.75rem'
      }}>
        {showDashboardButton && (
          <button 
            onClick={goToDashboard} 
            className="btn btn-outline-secondary btn-sm"
            style={buttonStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
          >
            Dashboard
          </button>
        )}
        {showAdminButton && (
          <button 
            onClick={goToAdmin} 
            className="btn btn-outline-secondary btn-sm"
            style={buttonStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
          >
            Admin
          </button>
        )}
        {showTestingButton && (
          <button 
            onClick={goToTesting} 
            className="btn btn-outline-secondary btn-sm"
            style={buttonStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
          >
            Testing
          </button>
        )}
        {showTambahListingButton && (
          <button 
            onClick={goToTambahListing} 
            className="btn btn-outline-secondary btn-sm"
            style={buttonStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
          >
            Tambah Listing
          </button>
        )}
        
        {/* Logout Button - Only for admin users */}
        {isAdmin && (
          <button 
            onClick={handleLogout} 
            className="btn btn-outline-secondary btn-sm"
            style={buttonStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
          >
            Logout
          </button>
        )}
        
        {/* Profile Dropdown - Hidden for admin users only */}
        {!isAdmin && (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="btn btn-outline-secondary btn-sm"
            style={{
              ...buttonStyle,
              width: '40px',
              height: '40px',
              padding: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '2px solid var(--border-color)'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--primary-color)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <img
              src={defaultProfilePicture}
              alt="Profile"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%'
              }}
            />
          </button>
          
          {showProfileDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              background: 'var(--surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-lg)',
              minWidth: '180px',
              zIndex: 1001,
              overflow: 'hidden'
            }}>
              <button
                onClick={goToProfile}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--background)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                <i className="bi bi-person"></i>
                <span>Profile</span>
              </button>
              
              <div style={{
                height: '1px',
                background: 'var(--border-color)',
                margin: '0.25rem 0'
              }}></div>
              
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--background)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 