import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import CustomLogin from './components/CustomLogin'
import PropertyForm from './components/PropertyForm'
import Navbar from './components/Navbar'
import Dashboard from './user_page/dashboard'
import ListingDetails from './user_page/ListingDetails';

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
        <Route path="/listing/:id" element={<ListingDetails />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

// Admin Page Component
function AdminPage({ user }) {
  const allowedUserId = 'ae43f00b-4138-4baa-9bf2-897e5ee7abfe'
  
  if (user.id !== allowedUserId) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <>
      <Navbar showDashboardButton={true} />
      <PropertyForm user={user} />
    </>
  )
}

// Dashboard Page Component
function DashboardPage({ user }) {
  const allowedUserId = 'ae43f00b-4138-4baa-9bf2-897e5ee7abfe'
  
  return (
    <>
      <Navbar 
        title="Dashboard" 
        showAdminButton={user.id === allowedUserId} 
      />
      <Dashboard />
    </>
  )
}

export default App;
