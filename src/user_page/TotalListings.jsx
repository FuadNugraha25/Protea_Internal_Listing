import React, { useState, useEffect } from 'react';
import FoundationWrapper from '../components/FoundationWrapper';
import { supabase } from '../supabaseClient';
import { getOrCreateProfile } from '../utils/profileUtils';

function formatIDR(price) {
  if (!price || isNaN(Number(price))) return '-';
  return 'IDR ' + Number(price).toLocaleString('id-ID');
}

function TotalListings() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch all listings
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('user_id, owner')
          .order('created_at', { ascending: false });

        if (listingsError) {
          console.error('Error fetching listings:', listingsError);
          setAgents([]);
          setLoading(false);
          return;
        }

        if (!listingsData || listingsData.length === 0) {
          console.log('No listings data found');
          setAgents([]);
          setLoading(false);
          return;
        }

        console.log('Fetched listings:', listingsData.length);
        console.log('Sample listing:', listingsData[0]);

        // Group listings by user_id
        const listingsByUser = {};
        let listingsWithoutUserId = 0;
        
        listingsData.forEach(listing => {
          const userId = listing.user_id;
          if (!userId) {
            listingsWithoutUserId++;
            console.log('Listing without user_id:', listing);
            return;
          }

          if (!listingsByUser[userId]) {
            listingsByUser[userId] = {
              totalListings: 0
            };
          }

          listingsByUser[userId].totalListings++;
        });

        console.log('Listings grouped by user:', listingsByUser);
        console.log('Listings without user_id:', listingsWithoutUserId);

        // Get unique user IDs
        const userIds = Object.keys(listingsByUser);
        
        // Fetch profiles for all users
        let profilesMap = {};
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, full_name, email')
            .in('id', userIds);

          if (!profilesError && profilesData) {
            profilesMap = profilesData.reduce((acc, profile) => {
              acc[profile.id] = profile;
              return acc;
            }, {});
          }
        }

        // Build agents array with real data
        const agentsData = userIds.map(userId => {
          const profile = profilesMap[userId];
          const stats = listingsByUser[userId];
          
          // Get owner name from listing if profile doesn't exist
          const ownerName = profile 
            ? (profile.name || profile.full_name || profile.email || 'Unknown User')
            : (listingsData.find(l => l.user_id === userId)?.owner || 'Unknown User');

          return {
            id: userId,
            name: ownerName,
            email: profile?.email || 'N/A',
            phone: profile?.phone || 'N/A',
            totalListings: stats.totalListings
          };
        });

        // Sort by total listings (descending)
        agentsData.sort((a, b) => b.totalListings - a.totalListings);

        setAgents(agentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setAgents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calculate total listings
  const totalListings = agents.reduce((sum, agent) => sum + agent.totalListings, 0);

  if (loading) {
    return (
      <FoundationWrapper style={{ paddingTop: '1.5rem', minHeight: '100vh', background: '#f8f9fa' }}>
        <div className="grid-container" style={{ maxWidth: '1400px' }}>
          <div className="grid-x grid-margin-x">
            <div className="cell text-center" style={{ padding: '4rem 0' }}>
              <div style={{ 
                width: '3rem', 
                height: '3rem', 
                border: '4px solid #e6e6e6',
                borderTop: '4px solid #1779ba',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
              <p style={{ marginTop: '1rem', color: '#767676' }}>Loading data...</p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          </div>
        </div>
      </FoundationWrapper>
    );
  }

  return (
    <FoundationWrapper style={{ paddingTop: '1.5rem', minHeight: '100vh', background: '#f8f9fa' }}>
      <div className="grid-container" style={{ maxWidth: '1400px' }}>
        {/* Header */}
        <div className="grid-x grid-margin-x" style={{ marginBottom: '2rem' }}>
          <div className="cell">
            <div className="card" style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: '10px' }}>
              <div className="card-section" style={{ padding: '1.5rem' }}>
                <h1 style={{ 
                  fontSize: '2rem', 
                  fontWeight: 700, 
                  color: '#0a0a0a',
                  margin: 0,
                  marginBottom: '0.5rem'
                }}>
                  Total Listingan
                </h1>
                <p style={{ 
                  color: '#767676', 
                  fontSize: '1rem',
                  margin: 0
                }}>
                  Ringkasan total listingan dan statistik per agent
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="grid-x grid-margin-x grid-margin-y" style={{ marginBottom: '2rem' }}>
          <div className="cell small-12 medium-6 large-4">
            <div className="card" style={{ 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1779ba 0%, #14679e 100%)',
              color: '#fff'
            }}>
              <div className="card-section" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                  Total Listingan
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>
                  {totalListings}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Table */}
        <div className="grid-x grid-margin-x">
          <div className="cell">
            <div className="card" style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
              <div className="card-divider" style={{ 
                background: 'linear-gradient(135deg, #1779ba 0%, #14679e 100%)',
                color: '#fefefe',
                padding: '1rem 1.5rem',
                borderRadius: '12px 12px 0 0'
              }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                  Statistik Per Agent ({agents.length} Agents)
                </h3>
              </div>
              <div className="card-section" style={{ padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    margin: 0
                  }}>
                    <thead>
                      <tr style={{ 
                        background: '#f8f9fa', 
                        borderBottom: '2px solid #e6e6e6' 
                      }}>
                        <th style={{ 
                          padding: '1rem 1.5rem', 
                          textAlign: 'left', 
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#767676'
                        }}>
                          Agent
                        </th>
                        <th style={{ 
                          padding: '1rem 1.5rem', 
                          textAlign: 'left', 
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#767676'
                        }}>
                          Kontak
                        </th>
                        <th style={{ 
                          padding: '1rem 1.5rem', 
                          textAlign: 'center', 
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#767676'
                        }}>
                          Total Listingan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.length === 0 ? (
                        <tr>
                          <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#767676' }}>
                            No listings found
                          </td>
                        </tr>
                      ) : (
                        agents.map((agent, index) => (
                        <tr 
                          key={agent.id} 
                          style={{ 
                            borderBottom: '1px solid #e6e6e6',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <div style={{ fontWeight: 600, color: '#0a0a0a', marginBottom: '0.25rem' }}>
                              {agent.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#767676', wordBreak: 'break-all' }}>
                              ID: {agent.id}
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <div style={{ color: '#767676', fontSize: '0.875rem' }}>
                              {agent.email !== 'N/A' ? agent.email : 'No email'}
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                            <span style={{ 
                              display: 'inline-block',
                              padding: '0.5rem 1rem',
                              background: 'linear-gradient(135deg, #1779ba 0%, #14679e 100%)',
                              color: '#fff',
                              borderRadius: '8px',
                              fontSize: '1.125rem',
                              fontWeight: 700,
                              minWidth: '60px'
                            }}>
                              {agent.totalListings}
                            </span>
                          </td>
                        </tr>
                      ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FoundationWrapper>
  );
}

export default TotalListings;

