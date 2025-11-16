import React, { useState } from 'react';
import FoundationWrapper from '../components/FoundationWrapper';

function formatIDR(price) {
  if (!price || isNaN(Number(price))) return '-';
  return 'IDR ' + Number(price).toLocaleString('id-ID');
}

function BackupListings() {
  // Dummy data for all listings
  const [listings] = useState([
    {
      id: 1,
      title: 'Rumah Mewah di Jakarta Selatan',
      property_type: 'Rumah',
      transaction_type: 'Jual',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      price: 2500000000,
      lt: 200,
      lb: 150,
      kt: 4,
      km: 3,
      status: 'active'
    },
    {
      id: 2,
      title: 'Apartemen Strategis di Bandung',
      property_type: 'Apartemen',
      transaction_type: 'Sewa',
      city: 'Bandung',
      province: 'Jawa Barat',
      price: 5000000,
      lt: 50,
      lb: 45,
      kt: 2,
      km: 1,
      status: 'active'
    },
    {
      id: 3,
      title: 'Kavling Tanah di Surabaya',
      property_type: 'Kavling',
      transaction_type: 'Jual',
      city: 'Surabaya',
      province: 'Jawa Timur',
      price: 500000000,
      lt: 300,
      lb: null,
      kt: null,
      km: null,
      status: 'active'
    },
    {
      id: 4,
      title: 'Rumah Minimalis di Yogyakarta',
      property_type: 'Rumah',
      transaction_type: 'Jual',
      city: 'Yogyakarta',
      province: 'DI Yogyakarta',
      price: 800000000,
      lt: 120,
      lb: 100,
      kt: 3,
      km: 2,
      status: 'active'
    },
    {
      id: 5,
      title: 'Apartemen Modern di Semarang',
      property_type: 'Apartemen',
      transaction_type: 'Sewa',
      city: 'Semarang',
      province: 'Jawa Tengah',
      price: 3500000,
      lt: 40,
      lb: 35,
      kt: 1,
      km: 1,
      status: 'active'
    },
    {
      id: 6,
      title: 'Rumah Tipe 45 di Bekasi',
      property_type: 'Rumah',
      transaction_type: 'Jual',
      city: 'Bekasi',
      province: 'Jawa Barat',
      price: 450000000,
      lt: 90,
      lb: 45,
      kt: 2,
      km: 1,
      status: 'active'
    },
    {
      id: 7,
      title: 'Villa Mewah di Bali',
      property_type: 'Rumah',
      transaction_type: 'Sewa',
      city: 'Denpasar',
      province: 'Bali',
      price: 15000000,
      lt: 500,
      lb: 300,
      kt: 5,
      km: 4,
      status: 'active'
    },
    {
      id: 8,
      title: 'Kavling Strategis di Tangerang',
      property_type: 'Kavling',
      transaction_type: 'Jual',
      city: 'Tangerang',
      province: 'Banten',
      price: 350000000,
      lt: 150,
      lb: null,
      kt: null,
      km: null,
      status: 'active'
    }
  ]);

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
                  Backup Listingan
                </h1>
                <p style={{ 
                  color: '#767676', 
                  fontSize: '1rem',
                  margin: 0
                }}>
                  Daftar lengkap semua listingan yang tersedia ({listings.length} listingan)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Table */}
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
                  Semua Listingan
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
                          ID
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
                          Judul
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
                          Tipe
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
                          Transaksi
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
                          Lokasi
                        </th>
                        <th style={{ 
                          padding: '1rem 1.5rem', 
                          textAlign: 'right', 
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#767676'
                        }}>
                          Harga
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
                          Spesifikasi
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
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map((listing, index) => (
                        <tr 
                          key={listing.id} 
                          style={{ 
                            borderBottom: '1px solid #e6e6e6',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '1rem 1.5rem', color: '#767676', fontSize: '0.875rem' }}>
                            #{listing.id}
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <div style={{ fontWeight: 600, color: '#0a0a0a' }}>
                              {listing.title}
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <span style={{ 
                              display: 'inline-block',
                              padding: '0.375rem 0.75rem',
                              background: '#e6e6e6',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: '#0a0a0a'
                            }}>
                              {listing.property_type}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 1.5rem', color: '#767676' }}>
                            {listing.transaction_type}
                          </td>
                          <td style={{ padding: '1rem 1.5rem', color: '#767676' }}>
                            <div>{listing.city}</div>
                            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                              {listing.province}
                            </div>
                          </td>
                          <td style={{ 
                            padding: '1rem 1.5rem', 
                            textAlign: 'right', 
                            fontWeight: 600, 
                            color: '#1779ba' 
                          }}>
                            {formatIDR(listing.price)}
                          </td>
                          <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.875rem', color: '#767676', lineHeight: '1.6' }}>
                              {listing.lt && <div>LT: {listing.lt} m²</div>}
                              {listing.lb && <div>LB: {listing.lb} m²</div>}
                              {listing.kt && <div>KT: {listing.kt}</div>}
                              {listing.km && <div>KM: {listing.km}</div>}
                              {!listing.lt && !listing.lb && !listing.kt && !listing.km && (
                                <div>-</div>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                            <span style={{ 
                              display: 'inline-block',
                              padding: '0.375rem 0.75rem',
                              background: listing.status === 'active' ? '#28a745' : '#ffc107',
                              color: listing.status === 'active' ? '#fff' : '#0a0a0a',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              textTransform: 'capitalize'
                            }}>
                              {listing.status}
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

export default BackupListings;

