import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import CustomLogin from './components/CustomLogin'
import PropertyForm from './components/PropertyForm'
import EditPropertyForm from './components/EditPropertyForm'
import Navbar from './components/Navbar'
import Dashboard from './user_page/dashboard'
import ListingDetails from './user_page/ListingDetails';
import ConfirmListings from './user_page/ConfirmListings';
import TotalListings from './user_page/TotalListings';
import BackupListings from './user_page/BackupListings';
import Profile from './user_page/Profile';
import ListingPribadi from './user_page/ListingPribadi';

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) return <CustomLogin />

  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPage user={user} />} />
        <Route path="/dashboard" element={<DashboardPage user={user} />} />
        <Route path="/tambah-listing" element={<AddListingPage user={user} />} />
        <Route path="/listing-pribadi" element={<ListingPribadiPage user={user} />} />
        <Route path="/confirm-listings" element={<ConfirmListingsPage user={user} />} />
        <Route path="/total-listings" element={<TotalListingsPage user={user} />} />
        <Route path="/backup" element={<BackupListingsPage user={user} />} />
        <Route path="/listing/:id" element={<ListingDetails />} />
        <Route path="/edit-listing/:id" element={<EditPropertyForm />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

// Admin Page Component
function AdminPage({ user }) {
  const navigate = useNavigate();
  const allowedUserIds = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136']
  
  if (!allowedUserIds.includes(user.id)) {
    return <Navigate to="/dashboard" replace />
  }

  const goToConfirmListings = () => {
    navigate('/confirm-listings');
  };

  const goToTotalListings = () => {
    navigate('/total-listings');
  };

  const goToBackup = () => {
    navigate('/backup');
  };

  return (
    <>
      <Navbar 
        showDashboardButton={true}
        user={user}
      />
      <div style={{ display: 'flex', marginTop: '73px', minHeight: 'calc(100vh - 73px)' }}>
        {/* Persistent Sidebar */}
        <div
          style={{
            width: '280px',
            background: 'var(--surface)',
            borderRight: '1px solid var(--border-color)',
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: '73px',
            left: 0,
            height: 'calc(100vh - 73px)',
            overflowY: 'auto',
            zIndex: 100
          }}
        >
          {/* Sidebar Header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
            color: '#fff'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Admin Panel</h3>
          </div>

          {/* Sidebar Content */}
          <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'var(--primary-color)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>📝</span>
                <span>Buat Listingan</span>
              </button>

              <button
                onClick={goToConfirmListings}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                <span>📊</span>
                <span>Listingan Log</span>
              </button>

              <button
                onClick={goToTotalListings}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                <span>📊</span>
                <span>Total Listingan</span>
              </button>
            </div>

            {/* Backup Button at Bottom */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={goToBackup}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                <span>💾</span>
                <span>Backup</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ marginLeft: '280px', flex: 1, width: 'calc(100% - 280px)' }}>
          <PropertyForm user={user} />
        </div>
      </div>
    </>
  )
}

// Dashboard Page Component
function DashboardPage({ user }) {
  const allowedUserIds = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136']
  const isAdmin = allowedUserIds.includes(user.id);
  
  return (
    <>
      <Navbar 
        showDashboardButton={true}
        showAdminButton={isAdmin}
        showTambahListingButton={!isAdmin}  // Only show for non-admin users
        showListingPribadiButton={!isAdmin}
        user={user}
      />
      <Dashboard user={user} />
    </>
  )
}

// Add Listing Page Component
function AddListingPage({ user }) {
  const allowedUserIds = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136']
  const isAdmin = allowedUserIds.includes(user.id);
  
  return (
    <>
      <Navbar 
        showDashboardButton={true}
        showAdminButton={isAdmin}
        showTambahListingButton={!isAdmin}
        showListingPribadiButton={!isAdmin}
        user={user}
      />
      <PropertyForm user={user} />
    </>
  )
}

// Listing Pribadi Page Component
function ListingPribadiPage({ user }) {
  return <ListingPribadi user={user} />
}

// Confirm Listings Page Component
function ConfirmListingsPage({ user }) {
  const navigate = useNavigate();
  const allowedUserIds = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136']
  
  if (!allowedUserIds.includes(user.id)) {
    return <Navigate to="/dashboard" replace />
  }

  const goToAdmin = () => {
    navigate('/admin');
  };

  const goToTotalListings = () => {
    navigate('/total-listings');
  };

  const goToBackup = () => {
    navigate('/backup');
  };

  return (
    <>
      <Navbar 
        showDashboardButton={true}
        user={user}
      />
      <div style={{ display: 'flex', marginTop: '73px', minHeight: 'calc(100vh - 73px)' }}>
        {/* Persistent Sidebar */}
        <div
          style={{
            width: '280px',
            background: 'var(--surface)',
            borderRight: '1px solid var(--border-color)',
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: '73px',
            left: 0,
            height: 'calc(100vh - 73px)',
            overflowY: 'auto',
            zIndex: 100
          }}
        >
          {/* Sidebar Header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
            color: '#fff'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Admin Panel</h3>
          </div>

          {/* Sidebar Content */}
          <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={goToAdmin}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                <span>📝</span>
                <span>Buat Listingan</span>
              </button>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'var(--primary-color)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>📊</span>
                <span>Listingan Log</span>
              </button>

              <button
                onClick={goToTotalListings}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                <span>📊</span>
                <span>Total Listingan</span>
              </button>
            </div>

            {/* Backup Button at Bottom */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={goToBackup}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                <span>💾</span>
                <span>Backup</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ marginLeft: '280px', flex: 1, width: 'calc(100% - 280px)' }}>
          <ConfirmListings />
        </div>
      </div>
    </>
  )
}

// Total Listings Page Component
function TotalListingsPage({ user }) {
  const navigate = useNavigate();
  const allowedUserIds = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136']
  
  if (!allowedUserIds.includes(user.id)) {
    return <Navigate to="/dashboard" replace />
  }

  const goToAdmin = () => {
    navigate('/admin');
  };

  const goToConfirmListings = () => {
    navigate('/confirm-listings');
  };

  const goToBackup = () => {
    navigate('/backup');
  };

  return (
    <>
      <Navbar 
        showDashboardButton={true}
        user={user}
      />
      <div style={{ display: 'flex', marginTop: '73px', minHeight: 'calc(100vh - 73px)' }}>
        {/* Persistent Sidebar */}
        <div
          style={{
            width: '280px',
            background: 'var(--surface)',
            borderRight: '1px solid var(--border-color)',
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: '73px',
            left: 0,
            height: 'calc(100vh - 73px)',
            overflowY: 'auto',
            zIndex: 100
          }}
        >
          {/* Sidebar Header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
            color: '#fff'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Admin Panel</h3>
          </div>

          {/* Sidebar Content */}
          <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={goToAdmin}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                <span>📝</span>
                <span>Buat Listingan</span>
              </button>

              <button
                onClick={goToConfirmListings}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                <span>📊</span>
                <span>Listingan Log</span>
              </button>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'var(--primary-color)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>📊</span>
                <span>Total Listingan</span>
              </button>
            </div>

            {/* Backup Button at Bottom */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={goToBackup}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                <span>💾</span>
                <span>Backup</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ marginLeft: '280px', flex: 1, width: 'calc(100% - 280px)' }}>
          <TotalListings />
        </div>
      </div>
    </>
  )
}

// Backup Listings Page Component
function BackupListingsPage({ user }) {
  const navigate = useNavigate();
  const allowedUserIds = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136']
  
  if (!allowedUserIds.includes(user.id)) {
    return <Navigate to="/dashboard" replace />
  }

  const goToAdmin = () => {
    navigate('/admin');
  };

  const goToConfirmListings = () => {
    navigate('/confirm-listings');
  };

  const goToTotalListings = () => {
    navigate('/total-listings');
  };

  return (
    <>
      <Navbar 
        showDashboardButton={true}
        user={user}
      />
      <div style={{ display: 'flex', marginTop: '73px', minHeight: 'calc(100vh - 73px)' }}>
        {/* Persistent Sidebar */}
        <div
          style={{
            width: '280px',
            background: 'var(--surface)',
            borderRight: '1px solid var(--border-color)',
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: '73px',
            left: 0,
            height: 'calc(100vh - 73px)',
            overflowY: 'auto',
            zIndex: 100
          }}
        >
          {/* Sidebar Header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
            color: '#fff'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Admin Panel</h3>
          </div>

          {/* Sidebar Content */}
          <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={goToAdmin}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                <span>📝</span>
                <span>Buat Listingan</span>
              </button>

              <button
                onClick={goToConfirmListings}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                <span>📊</span>
                <span>Listingan Log</span>
              </button>

              <button
                onClick={goToTotalListings}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--background)';
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                <span>📊</span>
                <span>Total Listingan</span>
              </button>
            </div>

            {/* Backup Button at Bottom */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'var(--primary-color)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>💾</span>
                <span>Backup</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ marginLeft: '280px', flex: 1, width: 'calc(100% - 280px)' }}>
          <BackupListings />
        </div>
      </div>
    </>
  )
}

export default App;
