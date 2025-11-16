import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
// import { useNavigate } from 'react-router-dom'

export default function CustomLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Add login-page class to body when component mounts
    document.body.classList.add('login-page');
    
    // Remove login-page class when component unmounts
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem 1rem' }}>
      <div className="card shadow-lg p-4" style={{ 
        maxWidth: '400px', 
        width: '100%', 
        borderRadius: '16px',
        border: 'none',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold mb-2" style={{ color: 'var(--text-primary)', fontSize: '1.75rem' }}>Hi! Login dulu yuk</h3>
          <small className="text-muted" style={{ fontSize: '0.875rem' }}>Masuknya pakai email protea yaa 😊</small>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="alert alert-danger py-2" style={{ 
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}
          <button 
            type="submit" 
            className="btn btn-primary w-100" 
            disabled={loading}
            style={{ 
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '10px',
              marginTop: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Logging in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 