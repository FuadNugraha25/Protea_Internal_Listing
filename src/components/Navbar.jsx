import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Navbar = ({ showAdminButton = false, showDashboardButton = false, onLogout }) => {
  const navigate = useNavigate();

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
        <button 
          onClick={handleLogout} 
          className="btn btn-outline-secondary btn-sm"
          style={buttonStyle}
          onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 