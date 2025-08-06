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
    letterSpacing: '0.05em',
    color: '#333',
    borderColor: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease'
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: 'rgba(51, 51, 51, 0.1)',
    color: '#000',
    borderColor: '#000'
  };

  return (
    <nav style={{ 
      position: 'fixed',
      top: -2,
      left: 0,
      right: 0,
      background: 'rgba(231, 231, 231, 0.85)', 
      backdropFilter: 'blur(5px)',
      WebkitBackdropFilter: 'blur(5px)',
      padding: '10px 20px', 
      borderBottom: '1px solid rgba(100, 100, 100, 0.5)',
      fontSize: '1.1rem',
      zIndex: 1000
    }}>
      <div style={{ 
        textAlign: 'left', 
        padding: '0.75rem 0', 
        fontWeight: 600, 
        letterSpacing: '0.05em',
        display: 'inline-block',
        color: '#333'
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