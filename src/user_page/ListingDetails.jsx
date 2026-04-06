import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FaBed, FaBath, FaRulerCombined, FaHome } from "react-icons/fa";
import Navbar from "../components/Navbar";
import FoundationWrapper from "../components/FoundationWrapper";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { getOrCreateProfile } from '../utils/profileUtils';


function formatIDR(price) {
  if (!price || isNaN(Number(price))) return '-';
  return 'IDR ' + Number(price).toLocaleString('id-ID');
}

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [user, setUser] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [agentName, setAgentName] = useState("");
  const toast = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

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
    async function fetchListing() {
      const { data, error } = await supabase.from("listings").select().eq("id", id).single();
      if (error || !data) {
        setListing(null);
      } else {
        setListing({
          ...data,
          image: data.image_urls,
          beds: data.kt || data.beds || "-",
          baths: data.km || data.baths || "-",
          lt: data.lt || "-",
          lb: data.lb || "-",
          type: data.type || "-",
          status: data.status || "-",
          location: data.city || data.location || "-",
          price: data.price || "-",
          description: data.description || "",
        });
      }
    }
    fetchListing();
  }, [id]);

  const allowedUserId = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136'];

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      if (listing?.image_urls) {
        try {
          const imageUrl = listing.image_urls;
          const pathMatch = imageUrl.match(/house-photos\/([^?]+)/);
          if (pathMatch) {
            const filePath = pathMatch[1];
            await supabase.storage.from("house-photos").remove([filePath]);
          }
        } catch (imageError) {
          console.error('Error deleting image:', imageError);
        }
      }

      const { error } = await supabase.from("listings").delete().eq("id", id);
      
      if (error) {
        console.error('Error deleting listing:', error);
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete listing. Please try again.',
          life: 3000
        });
        setShowDeleteConfirm(false);
        return;
      }

      setIsDeleted(true);
      setShowDeleteConfirm(false);
      
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Listing deleted successfully!',
        life: 3000
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error during deletion:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'An error occurred while deleting the listing. Please try again.',
        life: 3000
      });
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Toast ref={toast} />
      <Navbar 
        title="Listing Details" 
        showDashboardButton={true}
        showAdminButton={user && allowedUserId.includes(user.id)}
        showTambahListingButton={true}
        showListingPribadiButton={true}
        user={user}
      />
      
      <div className="animate-fade-in" style={{ 
        minHeight: '100vh', 
        background: 'var(--background)',
        paddingTop: '5rem',
        paddingBottom: '5rem'
      }}>
        {/* Navigation / Back Button */}
        <div className="container mt-4 mb-4" style={{ maxWidth: '1200px' }}>
          <button 
            className="btn btn-link text-decoration-none d-inline-flex align-items-center" 
            onClick={() => navigate('/dashboard')}
            style={{ color: 'var(--text-secondary)', padding: 0, fontWeight: 500 }}
          >
            <i className="bi bi-arrow-left me-2"></i> Back to Dashboard
          </button>
        </div>

        <div className="container" style={{ maxWidth: '1200px' }}>
          {/* Main Layout Grid */}
          <div className="row g-4 lg-row-reverse">
            
            {/* Left/Top Column: Image Gallery/Hero */}
            <div className="col-12 col-lg-8">
              <div className="glass-card p-2" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  paddingTop: '65%', // Aspect ratio
                  borderRadius: '18px',
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.03)'
                }}>
                  <img
                    src={listing?.image}
                    alt={listing?.title}
                    className="animate-zoom-in"
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onLoad={(e) => e.target.style.opacity = 1}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="d-flex flex-column align-items-center justify-content-center h-100"><i class="bi bi-image text-muted display-1"></i><p class="text-muted mt-3">No Image Available</p></div>';
                    }}
                  />
                  {/* Overlay for Price on Mobile/Small screens */}
                  <div className="d-lg-none position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                     <div className="h2 fw-bold text-white mb-0">{formatIDR(listing?.price)}</div>
                  </div>
                </div>
              </div>

              {/* Description Section - Moved here for better flow on large screens */}
              <div className="mt-4">
                <div className="glass-card p-4 p-md-5" style={{ borderRadius: '24px' }}>
                  <h4 className="fw-bold mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    About this listing
                  </h4>
                  <div style={{
                    whiteSpace: 'pre-line',
                    fontSize: '1.05rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.8,
                    fontWeight: 400
                  }}>
                    {listing?.description || "No description provided for this property."}
                  </div>
                </div>
              </div>
            </div>

            {/* Right/Sidebar Column: Info & Actions */}
            <div className="col-12 col-lg-4">
              <div className="sticky-top" style={{ top: '6.5rem' }}>
                <div className="glass-card p-4 p-md-5 mb-4" style={{ borderRadius: '24px' }}>
                  {/* Status & Type Badges */}
                  <div className="d-flex gap-2 mb-4">
                    <span className="badge px-3 py-1.5 rounded-pill" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontWeight: 500, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {listing?.transaction_type || 'For Sale'}
                    </span>
                    <span className="badge px-3 py-1.5 rounded-pill" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {listing?.property_type || 'Property'}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="h2 mb-2" style={{ color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                    {isDeleted ? "DELETED" : listing?.title}
                  </h1>
                  
                  {/* Location */}
                  <p className="mb-5 d-flex align-items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', fontWeight: 400 }}>
                    <i className="bi bi-geo-alt-fill text-primary opacity-75"></i>
                    {listing?.location}
                  </p>

                  {/* Specs Grid */}
                  <div className="row g-4 mb-5">
                    <div className="col-6">
                      <div className="p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 500 }}>Land Area</div>
                        <div className="d-flex align-items-center gap-2" style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600 }}>
                          {listing?.lt} m²
                        </div>
                      </div>
                    </div>
                    {listing?.property_type !== 'Kavling' && (
                       <div className="col-6">
                        <div className="p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 500 }}>Building</div>
                          <div className="d-flex align-items-center gap-2" style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600 }}>
                            {listing?.lb} m²
                          </div>
                        </div>
                      </div>
                    )}
                    {listing?.property_type !== 'Kavling' && (
                      <>
                        <div className="col-6">
                          <div className="p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 500 }}>Bedrooms</div>
                            <div className="d-flex align-items-center gap-2" style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600 }}>
                              {listing?.beds}
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 500 }}>Bathrooms</div>
                            <div className="d-flex align-items-center gap-2" style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600 }}>
                              {listing?.baths}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Price Card */}
                  <div className="p-4 rounded-4 mb-5 text-center glass-card" style={{ 
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                    background: 'rgba(15, 23, 42, 0.4)',
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)'
                  }}>
                    <div className="uppercase mb-2" style={{ 
                      color: 'rgba(255,255,255,0.4)', 
                      fontSize: '0.65rem', 
                      fontWeight: 500,
                      letterSpacing: '0.12em' 
                    }}>
                      OFFERING PRICE
                    </div>
                    <div className="fw-bold mb-0" style={{ 
                      fontSize: '1.65rem', 
                      fontWeight: 600,
                      background: 'linear-gradient(90deg, #6C7BFF, #8B5CF6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.01em',
                      fontVariantNumeric: 'tabular-nums',
                      textShadow: '0 0 12px rgba(108, 123, 255, 0.1)',
                      lineHeight: 1.2
                    }}>
                      {formatIDR(listing?.price)}
                    </div>
                  </div>

                  {/* Admin Actions */}
                  {user && allowedUserId.includes(user.id) && (
                    <div className="d-grid gap-3 pt-2">
                      <button 
                        className="btn btn-premium-primary py-3 fw-bold" 
                        onClick={() => navigate(`/edit-listing/${id}`)}
                      >
                        <i className="bi bi-pencil-square me-2"></i> Edit Property
                      </button>
                      <button 
                        className="btn btn-premium-danger py-3 fw-bold" 
                        onClick={handleDelete}
                      >
                        <i className="bi bi-trash3 me-2"></i> Delete Listing
                      </button>
                    </div>
                  )}
                </div>
                
                {/* styles for premium buttons */}
                <style>{`
                  .btn-premium-primary {
                    background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%);
                    border: none;
                    color: white;
                    border-radius: 12px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    height: 56px;
                    font-size: 1rem;
                  }
                  .btn-premium-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px -4px var(--primary-glow);
                    filter: brightness(1.1);
                  }
                  .btn-premium-danger {
                    background: rgba(239, 68, 68, 0.08);
                    border: 1px solid rgba(239, 68, 68, 0.25);
                    color: #ff4d4f;
                    border-radius: 12px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    height: 56px;
                    font-size: 1rem;
                  }
                  .btn-premium-danger:hover {
                    background: rgba(239, 68, 68, 0.15);
                    border-color: #ff4d4f;
                    color: #ff4d4f;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px -4px rgba(239, 68, 68, 0.2);
                  }
                `}</style>
                
                {/* Agent Card / Contact Info */}
                <div className="glass-card p-4 d-flex align-items-center gap-3" style={{ borderRadius: '24px' }}>
                   <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.05)', fontSize: '1.5rem' }}>
                      👤
                   </div>
                   <div>
                      <div className="small text-muted">Owned by</div>
                      <div className="fw-bold text-primary">{listing?.owner || 'Protea Admin'}</div>
                   </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={showDeleteConfirm}
        onHide={cancelDelete}
        header="Wait! Are you sure?"
        modal
        className="glass-dialog"
        style={{ width: '90%', maxWidth: '400px' }}
        footer={
          <div className="d-flex gap-2 justify-content-end p-3 pt-0">
            <button className="btn btn-link text-white text-decoration-none px-4" onClick={cancelDelete}>Cancel</button>
            <button className="btn btn-danger px-4 rounded-3 fw-bold" onClick={confirmDelete}>Yes, Delete</button>
          </div>
        }
      >
        <div className="p-3 text-center">
          <div className="display-4 text-danger mb-3">
             <i className="bi bi-exclamation-octagon"></i>
          </div>
          <p className="text-secondary" style={{ fontSize: '1.05rem' }}>
            This action will permanently remove <strong>{listing?.title}</strong>. This cannot be undone.
          </p>
        </div>
      </Dialog>
    </>
  );
}
