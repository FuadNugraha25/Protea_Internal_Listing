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
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)' }}>
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%', borderRadius: '1rem' }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold mb-0">Hi! Login dulu yuk</h3>
          <small className="text-muted">Masuknya pakai email protea yaa 😊</small>
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
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
} 