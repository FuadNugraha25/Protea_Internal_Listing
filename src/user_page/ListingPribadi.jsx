import React, { useState, useEffect } from "react";
import { FaBed, FaBath } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { getOrCreateProfile } from '../utils/profileUtils';
import Navbar from "../components/Navbar";

function formatIDR(price) {
  if (!price || isNaN(Number(price))) return '-';
  return 'IDR ' + Number(price).toLocaleString('id-ID');
}

// Helper function to get display name from owner field
function getOwnerName(owner) {
  return owner || 'Unknown Owner';
}

function ListingPribadi({ user }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentName, setAgentName] = useState("");
  const navigate = useNavigate();
  
  // Pagination state (max 30 cards per page)
  const ITEMS_PER_PAGE = 30;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchAgentName() {
      if (!user) return;
      
      // Check if user is admin
      const allowedUserIds = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136'];
      const isAdmin = allowedUserIds.includes(user.id);
      
      // For admin users, always show "Admin"
      if (isAdmin) {
        setAgentName('Admin');
        return;
      }
      
      // Use the utility function to get or create profile
      const profile = await getOrCreateProfile(user);
      
      if (profile) {
        const name = profile.name || profile.full_name || user.email?.split('@')[0] || 'User';
        setAgentName(name);
      } else {
        // Fallback to email username if profile creation fails
        const fallbackName = user.email?.split('@')[0] || 'User';
        setAgentName(fallbackName);
      }
    }
    
    fetchAgentName();
  }, [user]);

  useEffect(() => {
    async function fetchListings() {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch only listings created by the current user
        const { data, error } = await supabase
          .from("listings")
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error || !data) {
          console.error('Error fetching listings:', error);
          setListings([]);
          setLoading(false);
          return;
        }

        // Map listings
        const mapped = data.map((item) => {
          let owner = item.owner;
          if (owner === null || owner === undefined || owner === '') {
            owner = 'Unknown Owner';
          } else {
            owner = String(owner).trim();
            if (owner === '') {
              owner = 'Unknown Owner';
            }
          }
          
          return {
            ...item,
            image: item.image_urls,
            beds: item.kt ?? item.beds ?? null,
            baths: item.km ?? item.baths ?? null,
            lt: item.lt ?? null,
            lb: item.lb ?? null,
            type: item.type ?? "-",
            status: item.status ?? "-",
            location: item.city ?? item.location ?? "-",
            province: item.province ?? "-",
            district: item.district ?? "-",
            price: item.price || "-",
            owner: owner,
          };
        });
        
        setListings(mapped);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setListings([]);
      }
      setLoading(false);
    }
    
    fetchListings();
  }, [user]);

  // Filter out deleted listings
  const filteredListings = listings.filter(listing => {
    return (listing.title || "").trim() !== "DELETED";
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedListings = filteredListings.slice(startIndex, endIndex);

  // Clamp current page if results shrink
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const allowedUserIds = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136'];

  return (
    <>
      <Navbar 
        showDashboardButton={true}
        showAdminButton={user && allowedUserIds.includes(user.id)}
        showTambahListingButton={user && !allowedUserIds.includes(user.id)}
        showListingPribadiButton={user && !allowedUserIds.includes(user.id)}
        user={user}
      />
      <div style={{ background: 'var(--background)', minHeight: '100vh', paddingBottom: '2rem', paddingTop: '6rem' }}>
        <div className="container mb-5" style={{ marginTop: '1rem' }}>
          <div className="row mb-4">
            <div className="col">
              <h3 className="fw-bold mb-0" style={{ color: 'var(--text-primary)', fontSize: '2rem' }}>
                {agentName ? `Welcome, ${agentName}` : 'Welcome'}
              </h3>
              <p className="text-muted mt-2" style={{ fontSize: '1rem' }}>
                Listing Pribadi - Your Personal Listings
              </p>
            </div>
          </div>

          {/* Results Info */}
          <div className="row mb-4">
            <div className="col">
              <p className="text-muted mb-0" style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                <i className="bi bi-house-door me-2"></i>
                Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredListings.length}</strong> of your properties
              </p>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="row g-4">
            {loading ? (
              <div className="text-center" style={{ padding: '3rem', color: 'var(--text-secondary)' }}>
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>Loading your properties...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center" style={{ padding: '3rem', color: 'var(--text-secondary)' }}>
                <i className="bi bi-inbox fs-1 mb-3 d-block" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}></i>
                <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>No properties found.</p>
                <p style={{ fontSize: '0.875rem' }}>You haven't created any listings yet. Click "Tambah Listing" to get started!</p>
              </div>
            ) : paginatedListings.map((listing) => (
              <div className="col-lg-4 col-md-6" key={listing.id}>
                <div 
                  className="card h-100 border-0" 
                  style={{
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'var(--surface)'
                  }}
                  onClick={() => navigate(`/listing/${listing.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                >
                  <div className="position-relative">
                    <img
                      src={listing.image}
                      className="card-img-top"
                      alt={listing.title}
                      style={{ height: "250px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="card-body" style={{ padding: '1.25rem' }}>
                    <h5 className="card-title fw-bold mb-2" style={{ color: 'var(--text-primary)', fontSize: '1.125rem' }}>{listing.title}</h5>
                    <p className="text-muted mb-2" style={{ fontSize: '0.875rem' }}>
                      <i className="bi bi-geo-alt me-1" style={{ color: 'var(--primary-color)' }}></i>
                      {listing.location}
                    </p>
                    <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>
                      <i className="bi bi-person me-1" style={{ color: 'var(--primary-color)' }}></i>
                      Owner: <strong>{getOwnerName(listing.owner)}</strong>
                    </p>
                    {listing.property_type === 'Kavling' ? (
                      <div className="row text-center mb-3">
                        <div className="col-12">
                          <div className="fw-bold">{listing.lt}</div>
                          <small className="text-muted">Total Luas (m²)</small>
                        </div>
                      </div>
                    ) : (
                      <div className="row text-center mb-3">
                        <div className="col-3">
                          <div className="fw-bold">{listing.beds}</div>
                          <div className="d-flex align-items-center justify-content-center mb-1">
                            <FaBed className="text-primary me-1" />
                          </div>
                        </div>
                        <div className="col-3">
                          <div className="fw-bold">{listing.baths}</div>
                          <div className="d-flex align-items-center justify-content-center mb-1">
                            <FaBath className="text-primary me-1" />
                          </div>
                        </div>
                        <div className="col-3">
                          <div className="fw-bold">{listing.lt}</div>
                          <small className="text-muted">LT</small>
                        </div>
                        <div className="col-3">
                          <div className="fw-bold">{listing.lb}</div>
                          <small className="text-muted">LB</small>
                        </div>
                      </div>
                    )}
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="h5 text-primary fw-bold mb-0">
                        {formatIDR(listing.price)}
                        {listing.property_type === 'Kavling' && <small className="text-muted">/m²</small>}
                        {listing.transaction_type === 'Sewa' && <small className="text-muted">/Tahun</small>}
                      </span>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/listing/${listing.id}`);
                        }}
                        style={{ borderRadius: '8px', fontWeight: 600 }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {!loading && filteredListings.length > ITEMS_PER_PAGE && (
            <div className="row mt-4">
              <div className="col d-flex justify-content-center align-items-center gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ borderRadius: '8px' }}
                >
                  <i className="bi bi-chevron-left me-1"></i>
                  Prev
                </button>
                <span className="text-muted" style={{ fontWeight: 500, padding: '0 1rem' }}>
                  Page <strong style={{ color: 'var(--text-primary)' }}>{currentPage}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{totalPages}</strong>
                </span>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ borderRadius: '8px' }}
                >
                  Next
                  <i className="bi bi-chevron-right ms-1"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ListingPribadi;

