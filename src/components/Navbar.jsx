import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Navbar = ({ title = "Admin", showDashboardButton = false, showAdminButton = false }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Optionally, you can redirect or refresh the page here
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-2 mb-4" style={{ fontSize: '1rem' }}>
      <div className="container-fluid px-3">
        <span className="navbar-brand fw-semibold">{title}</span>
        <div className="ms-auto d-flex gap-2">
          {showDashboardButton && (
            <button className="btn btn-outline-light btn-sm" onClick={handleDashboardClick}>
              Dashboard
            </button>
          )}
          {showAdminButton && (
            <button className="btn btn-outline-light btn-sm" onClick={handleAdminClick}>
              Admin
            </button>
          )}
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 