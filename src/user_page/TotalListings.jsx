import React, { useState } from 'react';
import FoundationWrapper from '../components/FoundationWrapper';

function formatIDR(price) {
  if (!price || isNaN(Number(price))) return '-';
  return 'IDR ' + Number(price).toLocaleString('id-ID');
}

function TotalListings() {
  // Dummy data for agents
  const [agents] = useState([
    {
      id: 1,
      name: 'Budi Santoso',
      email: 'budi.santoso@protea.com',
      phone: '+62 812-3456-7890',
      totalListings: 15,
      activeListings: 12,
      pendingListings: 3
    },
    {
      id: 2,
      name: 'Siti Nurhaliza',
      email: 'siti.nurhaliza@protea.com',
      phone: '+62 812-3456-7891',
      totalListings: 23,
      activeListings: 20,
      pendingListings: 3
    },
    {
      id: 3,
      name: 'Ahmad Fauzi',
      email: 'ahmad.fauzi@protea.com',
      phone: '+62 812-3456-7892',
      totalListings: 8,
      activeListings: 7,
      pendingListings: 1
    },
    {
      id: 4,
      name: 'Dewi Lestari',
      email: 'dewi.lestari@protea.com',
      phone: '+62 812-3456-7893',
      totalListings: 19,
      activeListings: 18,
      pendingListings: 1
    },
    {
      id: 5,
      name: 'Rizki Pratama',
      email: 'rizki.pratama@protea.com',
      phone: '+62 812-3456-7894',
      totalListings: 12,
      activeListings: 10,
      pendingListings: 2
    }
  ]);

  // Calculate total listings
  const totalListings = agents.reduce((sum, agent) => sum + agent.totalListings, 0);
  const totalActiveListings = agents.reduce((sum, agent) => sum + agent.activeListings, 0);
  const totalPendingListings = agents.reduce((sum, agent) => sum + agent.pendingListings, 0);

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

        {/* Summary Cards */}
        <div className="grid-x grid-margin-x grid-margin-y" style={{ marginBottom: '2rem' }}>
          <div className="cell small-12 medium-4">
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
          <div className="cell small-12 medium-4">
            <div className="card" style={{ 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
              color: '#fff'
            }}>
              <div className="card-section" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                  Listingan Aktif
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>
                  {totalActiveListings}
                </div>
              </div>
            </div>
          </div>
          <div className="cell small-12 medium-4">
            <div className="card" style={{ 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
              color: '#fff'
            }}>
              <div className="card-section" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                  Listingan Pending
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>
                  {totalPendingListings}
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
                        <th style={{ 
                          padding: '1rem 1.5rem', 
                          textAlign: 'center', 
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#767676'
                        }}>
                          Aktif
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
                          Pending
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.map((agent, index) => (
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
                            <div style={{ fontSize: '0.75rem', color: '#767676' }}>
                              ID: {agent.id}
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <div style={{ color: '#767676', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                              {agent.email}
                            </div>
                            <div style={{ color: '#767676', fontSize: '0.875rem' }}>
                              {agent.phone}
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
                          <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                            <span style={{ 
                              display: 'inline-block',
                              padding: '0.375rem 0.75rem',
                              background: '#28a745',
                              color: '#fff',
                              borderRadius: '6px',
                              fontSize: '0.9375rem',
                              fontWeight: 600
                            }}>
                              {agent.activeListings}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                            <span style={{ 
                              display: 'inline-block',
                              padding: '0.375rem 0.75rem',
                              background: '#ffc107',
                              color: '#0a0a0a',
                              borderRadius: '6px',
                              fontSize: '0.9375rem',
                              fontWeight: 600
                            }}>
                              {agent.pendingListings}
                            </span>
                          </td>
                        </tr>
                      ))}
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

