import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import FoundationWrapper from '../components/FoundationWrapper';
import { FaBed, FaBath } from 'react-icons/fa';

const Testing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalValue: 0,
    averagePrice: 0,
    propertiesByType: {}
  });
  
  const allowedUserIds = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136'];

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      
      // Redirect if not admin
      if (user && !allowedUserIds.includes(user.id)) {
        navigate('/dashboard');
      }
    }
    checkUser();
  }, [navigate]);

  useEffect(() => {
    async function fetchListings() {
      const { data, error } = await supabase.from("listings").select();
      if (!error && data) {
        const mapped = data.map((item) => ({
          ...item,
          price: item.price || 0,
          property_type: item.property_type || 'Unknown'
        }));
        setListings(mapped);
        
        // Calculate statistics
        const total = mapped.length;
        const totalValue = mapped.reduce((sum, item) => {
          const price = Number(item.price?.toString().replace(/[^0-9]/g, "")) || 0;
          return sum + price;
        }, 0);
        const averagePrice = total > 0 ? totalValue / total : 0;
        
        const byType = mapped.reduce((acc, item) => {
          const type = item.property_type || 'Unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        
        setStats({
          totalProperties: total,
          totalValue,
          averagePrice,
          propertiesByType: byType
        });
      }
    }
    fetchListings();
  }, []);

  const formatIDR = (price) => {
    if (!price || isNaN(Number(price))) return '-';
    return 'IDR ' + Number(price).toLocaleString('id-ID');
  };

  if (loading) {
    return (
      <FoundationWrapper style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="grid-container">
          <div className="grid-x grid-margin-x">
            <div className="cell text-center">
              <div style={{ 
                width: '3rem', 
                height: '3rem', 
                border: '4px solid #e6e6e6',
                borderTop: '4px solid #1779ba',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
              <p style={{ marginTop: '1rem', color: '#767676' }}>Loading...</p>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </FoundationWrapper>
    );
  }

  if (!user || !allowedUserIds.includes(user.id)) {
    return null; // Will redirect
  }

  return (
    <>
      <Navbar 
        showAdminButton={true}
        showTestingButton={true}
        user={user}
      />
      <FoundationWrapper style={{ paddingTop: '6rem', marginTop: '2rem', minHeight: 'calc(100vh - 6rem)', paddingBottom: '2rem' }}>
        <div className="grid-container">
          
          {/* Page Header */}
          <div className="grid-x grid-margin-x" style={{ marginBottom: '2rem' }}>
            <div className="cell">
              <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem', fontWeight: 700 }}>Testing Dashboard</h1>
              <p style={{ color: '#767676', fontSize: '1.125rem' }}>Advanced Foundation Framework Dashboard</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid-x grid-margin-x grid-margin-y" style={{ marginBottom: '2rem' }}>
            <div className="cell small-12 medium-6 large-3">
              <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #1779ba 0%, #14679e 100%)', color: '#fefefe', border: 'none' }}>
                <div className="card-section">
                  <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {stats.totalProperties}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total Properties
                  </div>
                </div>
              </div>
            </div>
            
            <div className="cell small-12 medium-6 large-3">
              <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #3adb76 0%, #2ecc71 100%)', color: '#fefefe', border: 'none' }}>
                <div className="card-section">
                  <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {formatIDR(stats.totalValue).replace('IDR ', '')}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total Value
                  </div>
                </div>
              </div>
            </div>
            
            <div className="cell small-12 medium-6 large-3">
              <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #ffae00 0%, #ff8c00 100%)', color: '#fefefe', border: 'none' }}>
                <div className="card-section">
                  <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {formatIDR(stats.averagePrice).replace('IDR ', '')}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Average Price
                  </div>
                </div>
              </div>
            </div>
            
            <div className="cell small-12 medium-6 large-3">
              <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #cc4b37 0%, #b83e2e 100%)', color: '#fefefe', border: 'none' }}>
                <div className="card-section">
                  <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {Object.keys(stats.propertiesByType).length}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Property Types
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid-x grid-margin-x grid-margin-y">
            
            {/* Left Column - Property Types Breakdown */}
            <div className="cell small-12 large-4">
              <div className="card">
                <div className="card-divider" style={{ background: '#1779ba', color: '#fefefe' }}>
                  <h4 style={{ margin: 0 }}>Property Types</h4>
                </div>
                <div className="card-section">
                  {Object.entries(stats.propertiesByType).map(([type, count]) => {
                    const percentage = stats.totalProperties > 0 ? (count / stats.totalProperties) * 100 : 0;
                    return (
                      <div key={type} style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 600 }}>{type}</span>
                          <span style={{ color: '#767676' }}>{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div style={{ 
                          height: '8px', 
                          background: '#e6e6e6', 
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${percentage}%`,
                            background: 'linear-gradient(90deg, #1779ba 0%, #14679e 100%)',
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* User Info Card */}
              <div className="card" style={{ marginTop: '1rem' }}>
                <div className="card-divider" style={{ background: '#767676', color: '#fefefe' }}>
                  <h4 style={{ margin: 0 }}>User Information</h4>
                </div>
                <div className="card-section">
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#767676', marginBottom: '0.25rem' }}>Email</div>
                    <div style={{ fontWeight: 600 }}>{user?.email || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#767676', marginBottom: '0.25rem' }}>User ID</div>
                    <div style={{ fontSize: '0.75rem', wordBreak: 'break-all', color: '#767676' }}>{user?.id || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Recent Properties Table */}
            <div className="cell small-12 large-8">
              <div className="card">
                <div className="card-divider" style={{ background: '#1779ba', color: '#fefefe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0 }}>Recent Properties</h4>
                  <button 
                    className="button small"
                    onClick={() => navigate('/dashboard')}
                    style={{ margin: 0, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
                  >
                    View All
                  </button>
                </div>
                <div className="card-section" style={{ padding: 0 }}>
                  {listings.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#767676' }}>
                      <p>No properties found.</p>
                    </div>
                  ) : (
                    <table style={{ width: '100%', margin: 0 }}>
                      <thead>
                        <tr style={{ background: '#f8f8f8', borderBottom: '2px solid #e6e6e6' }}>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Title</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Type</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Location</th>
                          <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listings.slice(0, 10).map((listing, index) => (
                          <tr 
                            key={listing.id} 
                            style={{ 
                              borderBottom: '1px solid #e6e6e6',
                              cursor: 'pointer',
                              transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f8f8'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            onClick={() => navigate(`/listing/${listing.id}`)}
                          >
                            <td style={{ padding: '1rem' }}>
                              <div style={{ fontWeight: 600 }}>{listing.title || 'Untitled'}</div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ 
                                display: 'inline-block',
                                padding: '0.25rem 0.75rem',
                                background: '#e6e6e6',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                fontWeight: 500
                              }}>
                                {listing.property_type || 'Unknown'}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', color: '#767676' }}>
                              {listing.city || listing.location || 'N/A'}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#1779ba' }}>
                              {formatIDR(listing.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid-x grid-margin-x" style={{ marginTop: '1rem' }}>
                <div className="cell small-12 medium-6">
                  <div className="callout primary">
                    <h5>Quick Actions</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button 
                        className="button"
                        onClick={() => navigate('/admin')}
                      >
                        Add New Property
                      </button>
                      <button 
                        className="button secondary"
                        onClick={() => navigate('/dashboard')}
                      >
                        View Dashboard
                      </button>
                    </div>
                  </div>
                </div>
                <div className="cell small-12 medium-6">
                  <div className="callout success">
                    <h5>System Status</h5>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>
                      <strong>Status:</strong> Operational<br/>
                      <strong>Properties:</strong> {stats.totalProperties} active<br/>
                      <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Cards Section */}
          <div className="grid-x grid-margin-x" style={{ marginTop: '2rem' }}>
            <div className="cell">
              <h2 style={{ marginBottom: '1.5rem', fontSize: '2rem', fontWeight: 700 }}>Property Listings</h2>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="grid-x grid-margin-x">
              <div className="cell">
                <div className="callout" style={{ textAlign: 'center', background: '#f8f8f8' }}>
                  <p style={{ margin: 0, color: '#767676' }}>No properties found.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid-x grid-margin-x grid-margin-y">
              {listings.slice(0, 12).map((listing) => (
                <div className="cell small-12 medium-4 large-4" key={listing.id}>
                  <div 
                    className="card"
                    style={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      border: '1px solid #e6e6e6',
                      overflow: 'hidden',
                      marginBottom: '1rem'
                    }}
                    onClick={() => navigate(`/listing/${listing.id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <img
                        src={listing.image_urls || listing.image}
                        alt={listing.title}
                        style={{ 
                          width: '100%', 
                          height: '180px', 
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x180?text=No+Image';
                        }}
                      />
                      {listing.property_type && (
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          background: '#1779ba',
                          color: '#fefefe',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '3px',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {listing.property_type}
                        </div>
                      )}
                    </div>
                    <div className="card-section" style={{ padding: '0.75rem' }}>
                      <h5 style={{ 
                        marginBottom: '0.5rem', 
                        fontSize: '0.95rem', 
                        fontWeight: 700,
                        color: '#0a0a0a',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {listing.title || 'Untitled Property'}
                      </h5>
                      <p style={{ 
                        marginBottom: '0.75rem', 
                        fontSize: '0.8rem', 
                        color: '#767676',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        <span style={{ fontSize: '0.7rem' }}>📍</span>
                        {listing.city || listing.location || 'Location not specified'}
                      </p>
                      
                      {listing.property_type === 'Kavling' ? (
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'center',
                          marginBottom: '0.75rem',
                          padding: '0.5rem',
                          background: '#f8f8f8',
                          borderRadius: '4px'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a0a0a' }}>
                              {listing.lt || '-'}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#767676', textTransform: 'uppercase' }}>
                              Total Luas (m²)
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid-x grid-margin-x" style={{ marginBottom: '0.75rem', textAlign: 'center' }}>
                          <div className="cell small-3">
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0a0a' }}>
                              {listing.kt || listing.beds || '-'}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#767676', marginTop: '0.2rem' }}>
                              <FaBed style={{ color: '#1779ba', fontSize: '0.7rem', marginRight: '0.2rem' }} />
                              Beds
                            </div>
                          </div>
                          <div className="cell small-3">
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0a0a' }}>
                              {listing.km || listing.baths || '-'}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#767676', marginTop: '0.2rem' }}>
                              <FaBath style={{ color: '#1779ba', fontSize: '0.7rem', marginRight: '0.2rem' }} />
                              Baths
                            </div>
                          </div>
                          <div className="cell small-3">
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0a0a' }}>
                              {listing.lt || '-'}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#767676', marginTop: '0.2rem' }}>
                              LT
                            </div>
                          </div>
                          <div className="cell small-3">
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0a0a' }}>
                              {listing.lb || '-'}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#767676', marginTop: '0.2rem' }}>
                              LB
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #e6e6e6'
                      }}>
                        <div>
                          <div style={{ 
                            fontSize: '1rem', 
                            fontWeight: 700, 
                            color: '#1779ba',
                            lineHeight: 1.2
                          }}>
                            {formatIDR(listing.price)}
                          </div>
                          {listing.property_type === 'Kavling' && (
                            <div style={{ fontSize: '0.65rem', color: '#767676' }}>per m²</div>
                          )}
                          {listing.transaction_type === 'Sewa' && (
                            <div style={{ fontSize: '0.65rem', color: '#767676' }}>per Tahun</div>
                          )}
                        </div>
                        <button
                          className="button small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/listing/${listing.id}`);
                          }}
                          style={{ margin: 0, padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Additional Info Section */}
          <div className="grid-x grid-margin-x" style={{ marginTop: '2rem' }}>
            <div className="cell">
              <div className="callout" style={{ background: '#f8f8f8' }}>
                <div className="grid-x grid-margin-x">
                  <div className="cell small-12 medium-4">
                    <h5 style={{ marginBottom: '0.5rem' }}>Foundation Framework</h5>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#767676' }}>
                      This dashboard is built using Foundation for Sites framework, demonstrating advanced grid layouts, cards, callouts, and interactive components.
                    </p>
                  </div>
                  <div className="cell small-12 medium-4">
                    <h5 style={{ marginBottom: '0.5rem' }}>Features</h5>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem', color: '#767676' }}>
                      <li>Responsive Grid System</li>
                      <li>Advanced Card Components</li>
                      <li>Interactive Tables</li>
                      <li>Progress Indicators</li>
                    </ul>
                  </div>
                  <div className="cell small-12 medium-4">
                    <h5 style={{ marginBottom: '0.5rem' }}>Statistics</h5>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#767676' }}>
                      Real-time data from Supabase database, including property counts, values, and type distributions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </FoundationWrapper>
    </>
  );
};

export default Testing;
