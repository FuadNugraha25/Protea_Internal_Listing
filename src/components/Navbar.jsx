import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Navbar = ({ showAdminButton = false, showDashboardButton = false, showTambahListingButton = false, showListingPribadiButton = false, user = null, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const mobileToggleRef = useRef(null);
  const mobileDrawerRef = useRef(null);

  // Default profile picture (light silhouette for dark theme)
  const defaultProfilePicture = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='35' r='20' fill='%2394a3b8'/%3E%3Cpath d='M 20 70 Q 20 55 50 55 Q 80 55 80 70 L 80 100 L 20 100 Z' fill='%2394a3b8'/%3E%3C/svg%3E";
  
  const allowedUserIds = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136'];
  const isAdmin = user && allowedUserIds.includes(user.id);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (onLogout) onLogout();
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      const outsideToggle = !mobileToggleRef.current || !mobileToggleRef.current.contains(event.target);
      const outsideDrawer = !mobileDrawerRef.current || !mobileDrawerRef.current.contains(event.target);
      if (outsideToggle && outsideDrawer) {
        setShowMobileMenu(false);
      }
    };
    if (showProfileDropdown || showMobileMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown, showMobileMenu]);

  const navItemStyle = (isActive) => ({
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-md)',
    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
    background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
    fontWeight: 600,
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left'
  });

  const dashboardActive = location.pathname === '/dashboard';
  const tambahListingActive = location.pathname === '/tambah-listing';
  const listingPribadiActive = location.pathname === '/listing-pribadi';
  const adminActive = location.pathname.startsWith('/admin');
  const mapActive = location.pathname === '/map';

  return (
    <>
      <nav className={`glass fixed-top py-3 px-4 px-md-5 d-flex align-items-center justify-content-between transition-all ${scrolled ? 'shadow-lg' : ''}`} 
        style={{ 
          zIndex: 1100,
          height: '75px',
          transition: 'all 0.3s ease',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent'
        }}>
        
        <div 
          onClick={() => navigate('/dashboard')}
          className="d-flex align-items-center gap-2 cursor-pointer"
          style={{ cursor: 'pointer' }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px var(--primary-glow)'
          }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>P</span>
          </div>
          <span className="h4 mb-0 fw-bold d-none d-sm-block" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: 'Outfit' }}>
            Protea Realty
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="d-none d-md-flex align-items-center gap-2">
          {(isAdmin || showDashboardButton) && (
            <button onClick={() => navigate('/dashboard')} style={{...navItemStyle(dashboardActive), width: 'auto'}}>
              Dashboard
            </button>
          )}
          {(isAdmin || showAdminButton) && (
            <button onClick={() => navigate('/admin')} style={{...navItemStyle(adminActive), width: 'auto'}}>
              Admin
            </button>
          )}
          {(!isAdmin && showTambahListingButton) && (
            <button onClick={() => navigate('/tambah-listing')} style={{...navItemStyle(tambahListingActive), width: 'auto'}}>
              Add Listing
            </button>
          )}
          {(isAdmin || showListingPribadiButton) && (
            <button onClick={() => navigate('/listing-pribadi')} style={{...navItemStyle(listingPribadiActive), width: 'auto'}}>
              My Listings
            </button>
          )}
          <button onClick={() => navigate('/map')} style={{...navItemStyle(mapActive), width: 'auto'}}>
            Map
          </button>

          <div className="ms-3 ps-3 border-start" style={{ borderColor: 'var(--border) !important' }}>
            <div ref={dropdownRef} className="position-relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="d-flex align-items-center justify-content-center p-0 overflow-hidden"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  transition: 'all 0.2s ease'
                }}
              >
                <img src={defaultProfilePicture} alt="Profile" className="w-100 h-100 object-fit-cover" />
              </button>
              
              {showProfileDropdown && (
                <div className="position-absolute end-0 mt-2 p-2 animate-fade-in" style={{
                  minWidth: '200px',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  zIndex: 1200
                }}>
                  <button
                    onClick={() => { setShowProfileDropdown(false); navigate('/profile'); }}
                    className="w-100 text-start p-2 rounded d-flex align-items-center gap-3 border-0 bg-transparent text-secondary hover-bg-surface"
                    style={{ transition: 'all 0.2s ease' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    <i className="bi bi-person h5 mb-0"></i>
                    <span>Profile Settings</span>
                  </button>
                  <div className="my-1 border-top" style={{ borderColor: 'var(--border) !important' }}></div>
                  <button
                    onClick={handleLogout}
                    className="w-100 text-start p-2 rounded d-flex align-items-center gap-3 border-0 bg-transparent text-danger"
                    style={{ transition: 'all 0.2s ease', opacity: 0.8 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
                  >
                    <i className="bi bi-box-arrow-right h5 mb-0"></i>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div ref={mobileToggleRef} className="d-md-none d-flex align-items-center gap-3">
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="btn btn-sm btn-outline-secondary p-2"
          >
            <i className={`bi ${showMobileMenu ? 'bi-x-lg' : 'bi-list'} h4 mb-0`}></i>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <div ref={mobileDrawerRef} className="glass animate-fade-in position-fixed w-100 shadow-xl" style={{
          top: '75px', 
          zIndex: 1050,
          borderBottom: '1px solid var(--border)',
          padding: '1.5rem'
        }}>
          <div className="d-flex flex-column gap-2">
            {(isAdmin || showDashboardButton) && (
              <button 
                onClick={() => { navigate('/dashboard'); setShowMobileMenu(false); }} 
                style={navItemStyle(dashboardActive)}
              >
                <i className="bi bi-grid me-2"></i> Dashboard
              </button>
            )}
            {(isAdmin || showAdminButton) && (
              <button 
                onClick={() => { navigate('/admin'); setShowMobileMenu(false); }} 
                style={navItemStyle(adminActive)}
              >
                <i className="bi bi-shield-lock me-2"></i> Admin
              </button>
            )}
            {(!isAdmin && showTambahListingButton) && (
              <button 
                onClick={() => { navigate('/tambah-listing'); setShowMobileMenu(false); }} 
                style={navItemStyle(tambahListingActive)}
              >
                <i className="bi bi-plus-lg me-2"></i> Add Listing
              </button>
            )}
            {(isAdmin || showListingPribadiButton) && (
              <button
                onClick={() => { navigate('/listing-pribadi'); setShowMobileMenu(false); }}
                style={navItemStyle(listingPribadiActive)}
              >
                <i className="bi bi-collection me-2"></i> My Listings
              </button>
            )}
            <button
              onClick={() => { navigate('/map'); setShowMobileMenu(false); }}
              style={navItemStyle(mapActive)}
            >
              <i className="bi bi-map me-2"></i> Map
            </button>
            <div className="my-2 border-top" style={{ borderColor: 'var(--border) !important' }}></div>
            <button 
              onClick={() => { navigate('/profile'); setShowMobileMenu(false); }} 
              style={navItemStyle(false)}
            >
              <i className="bi bi-person me-2"></i> Profile Settings
            </button>
            <button 
              onClick={handleLogout} 
              style={{...navItemStyle(false), color: 'var(--danger)'}}
            >
              <i className="bi bi-box-arrow-right me-2"></i> Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
 