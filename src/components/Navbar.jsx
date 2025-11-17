import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Navbar = ({ showAdminButton = false, showDashboardButton = false, showTambahListingButton = false, showListingPribadiButton = false, user = null, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const goToTambahListing = () => {
    navigate('/tambah-listing');
  };

  const goToListingPribadi = () => {
    navigate('/listing-pribadi');
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
    letterSpacing: '0.02em',
    color: 'var(--text-secondary)',
    border: 'none',
    background: 'transparent',
    transition: 'color 0.2s ease, background 0.2s ease',
    borderRadius: '6px',
    padding: '0.35rem 0.85rem',
    fontSize: '0.95rem',
    cursor: 'pointer'
  };

  const getButtonStyle = (isActive = false) => ({
    ...buttonStyle,
    color: isActive ? 'var(--primary-color)' : buttonStyle.color,
    background: isActive ? 'rgba(23, 121, 186, 0.12)' : buttonStyle.background,
    boxShadow: isActive ? 'inset 0 -2px 0 var(--primary-color)' : 'none'
  });

  const adminOverrideButtons = isAdmin;
  const dashboardVisible = adminOverrideButtons || showDashboardButton;
  const adminVisible = adminOverrideButtons || showAdminButton;
  const tambahListingVisible = !isAdmin && showTambahListingButton;
  const listingPribadiVisible = adminOverrideButtons || showListingPribadiButton;

  const handleHover = (e) => {
    e.currentTarget.style.color = 'var(--primary-color)';
    e.currentTarget.style.background = 'rgba(23, 121, 186, 0.12)';
  };

  const handleHoverExit = (e, isActive = false) => {
    const styles = getButtonStyle(isActive);
    Object.keys(styles).forEach(key => {
      e.currentTarget.style[key] = styles[key];
    });
  };

  const dashboardActive = location.pathname === '/dashboard';
  const tambahListingActive = location.pathname === '/tambah-listing';
  const listingPribadiActive = location.pathname === '/listing-pribadi';
  const adminActive = location.pathname.startsWith('/admin');

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
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div 
        onClick={goToDashboard}
        style={{ 
          textAlign: 'left', 
          padding: '0.5rem 0', 
          fontWeight: 700, 
          letterSpacing: '0.05em',
          display: 'inline-block',
          color: 'var(--text-primary)',
          fontSize: '1.25rem',
          cursor: 'pointer',
          transition: 'opacity 0.2s ease',
          marginLeft: '1.5rem',
          flex: '0 0 auto'
        }}
        onMouseEnter={(e) => {
          e.target.style.opacity = '0.7';
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '1';
        }}
      >
        Protea Realty
      </div>
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem',
        alignItems: 'center',
        flex: '0 0 auto',
        marginRight: '1.5rem'
      }}>
        {dashboardVisible && (
          <button 
            onClick={goToDashboard} 
            aria-current={dashboardActive ? 'page' : undefined}
            style={getButtonStyle(dashboardActive)}
            onMouseEnter={handleHover}
            onMouseLeave={(e) => handleHoverExit(e, dashboardActive)}
          >
            Dashboard
          </button>
        )}
        {adminVisible && (
          <button 
            onClick={goToAdmin} 
            aria-current={adminActive ? 'page' : undefined}
            style={getButtonStyle(adminActive)}
            onMouseEnter={handleHover}
            onMouseLeave={(e) => handleHoverExit(e, adminActive)}
          >
            Admin
          </button>
        )}
        {tambahListingVisible && (
          <button 
            onClick={goToTambahListing} 
            aria-current={tambahListingActive ? 'page' : undefined}
            style={getButtonStyle(tambahListingActive)}
            onMouseEnter={handleHover}
            onMouseLeave={(e) => handleHoverExit(e, tambahListingActive)}
          >
            Tambah Listing
          </button>
        )}
        {listingPribadiVisible && (
          <button 
            onClick={goToListingPribadi} 
            aria-current={listingPribadiActive ? 'page' : undefined}
            style={getButtonStyle(listingPribadiActive)}
            onMouseEnter={handleHover}
            onMouseLeave={(e) => handleHoverExit(e, listingPribadiActive)}
          >
            Listing Pribadi
          </button>
        )}
        
        {/* Logout Button - Only for admin users */}
        {isAdmin && (
          <button 
            onClick={handleLogout} 
            style={getButtonStyle(false)}
            onMouseEnter={handleHover}
            onMouseLeave={(e) => handleHoverExit(e, false)}
          >
            Logout
          </button>
        )}
        
        {/* Profile Dropdown - Hidden for admin users only */}
        {!isAdmin && (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            style={{
              ...getButtonStyle(false),
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