import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FaBed, FaBath, FaRulerCombined, FaHome } from "react-icons/fa";
import Navbar from "../components/Navbar";
import FoundationWrapper from "../components/FoundationWrapper";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';


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
  const toast = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

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
        title="Dashboard" 
        showAdminButton={user && allowedUserId.includes(user.id)}
        showTestingButton={user && allowedUserId.includes(user.id)}
        showTambahListingButton={user && !allowedUserId.includes(user.id)}
        user={user}
      />
      <FoundationWrapper style={{ paddingTop: '6rem', minHeight: '100vh', background: '#f8f9fa' }}>
        <div className="grid-container" style={{ maxWidth: '1400px' }}>
          
          {/* Action Bar */}
          {user && allowedUserId.includes(user.id) && (
            <div className="grid-x grid-margin-x" style={{ marginBottom: '1.5rem' }}>
              <div className="cell">
                <div className="card" style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: '10px' }}>
                  <div className="card-section" style={{ padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.625rem' }}>
                    <button 
                      className="button" 
                      onClick={() => navigate(`/edit-listing/${id}`)}
                      style={{ 
                        borderRadius: '6px',
                        padding: '0.5rem 1rem',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        background: '#ffae00',
                        color: '#0a0a0a',
                        border: 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="button alert" 
                      onClick={handleDelete}
                      style={{ 
                        borderRadius: '6px',
                        padding: '0.5rem 1rem',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid-x grid-margin-x grid-margin-y">
            
            {/* Left Column - Image */}
            <div className="cell small-12 large-8">
              <div className="card" style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#e6e6e6', overflow: 'hidden' }}>
                  <img
                    src={listing?.image}
                    alt={listing?.title}
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #767676; font-size: 0.9rem;">No Image Available</div>';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Key Info */}
            <div className="cell small-12 large-4">
              <div className="card" style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px', height: '100%' }}>
                <div className="card-section" style={{ padding: '1.25rem' }}>
                  {/* Title */}
                  <h1 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    color: '#0a0a0a',
                    lineHeight: 1.3,
                    marginBottom: '0.75rem',
                    letterSpacing: '-0.01em'
                  }}>
                    {isDeleted ? "DELETED" : listing?.title}
                  </h1>
                  
                  {/* Location */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.375rem',
                    marginBottom: '1rem',
                    color: '#767676',
                    fontSize: '0.875rem'
                  }}>
                    <span style={{ fontSize: '0.9rem' }}>📍</span>
                    <span>{listing?.location}</span>
                  </div>
                  
                  {/* Price */}
                  <div style={{ 
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #1779ba 0%, #14679e 100%)',
                    borderRadius: '10px',
                    marginBottom: '1.25rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: 'rgba(255,255,255,0.9)', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '0.375rem',
                      fontWeight: 600
                    }}>
                      Price
                    </div>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 700, 
                      color: '#fefefe',
                      lineHeight: 1.2
                    }}>
                      {formatIDR(listing?.price)}
                    </div>
                  </div>

                  {/* Property Type Badge */}
                  {listing?.property_type && (
                    <div style={{ 
                      display: 'inline-block',
                      padding: '0.375rem 0.75rem',
                      background: '#e6e6e6',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#0a0a0a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {listing.property_type}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Property Details Cards */}
          <div className="grid-x grid-margin-x grid-margin-y" style={{ marginTop: '1.5rem' }}>
            <div className="cell small-12">
              <div className="card" style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                <div className="card-divider" style={{ 
                  background: 'linear-gradient(135deg, #1779ba 0%, #14679e 100%)',
                  color: '#fefefe',
                  padding: '0.875rem 1.25rem',
                  borderRadius: '12px 12px 0 0'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>Property Details</h3>
                </div>
                <div className="card-section" style={{ padding: '1.25rem' }}>
                  <div className="grid-x grid-margin-x grid-margin-y">
                    <div className="cell small-6 medium-3">
                      <div className="card" style={{ 
                        border: '1px solid #e6e6e6',
                        borderRadius: '10px',
                        textAlign: 'center',
                        padding: '1rem',
                        background: '#fefefe',
                        transition: 'all 0.2s ease'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                          e.currentTarget.style.borderColor = '#1779ba';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = '#e6e6e6';
                        }}
                      >
                        <FaBed style={{ fontSize: '1.5rem', color: '#1779ba', marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a0a', marginBottom: '0.375rem' }}>
                          {listing?.beds}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#767676', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                          Bedrooms
                        </div>
                      </div>
                    </div>
                    
                    <div className="cell small-6 medium-3">
                      <div className="card" style={{ 
                        border: '1px solid #e6e6e6',
                        borderRadius: '10px',
                        textAlign: 'center',
                        padding: '1rem',
                        background: '#fefefe',
                        transition: 'all 0.2s ease'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                          e.currentTarget.style.borderColor = '#1779ba';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = '#e6e6e6';
                        }}
                      >
                        <FaBath style={{ fontSize: '1.5rem', color: '#1779ba', marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a0a', marginBottom: '0.375rem' }}>
                          {listing?.baths}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#767676', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                          Bathrooms
                        </div>
                      </div>
                    </div>
                    
                    <div className="cell small-6 medium-3">
                      <div className="card" style={{ 
                        border: '1px solid #e6e6e6',
                        borderRadius: '10px',
                        textAlign: 'center',
                        padding: '1rem',
                        background: '#fefefe',
                        transition: 'all 0.2s ease'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                          e.currentTarget.style.borderColor = '#1779ba';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = '#e6e6e6';
                        }}
                      >
                        <FaRulerCombined style={{ fontSize: '1.5rem', color: '#1779ba', marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a0a', marginBottom: '0.375rem' }}>
                          {listing?.lt} m²
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#767676', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                          Land Area
                        </div>
                      </div>
                    </div>
                    
                    <div className="cell small-6 medium-3">
                      <div className="card" style={{ 
                        border: '1px solid #e6e6e6',
                        borderRadius: '10px',
                        textAlign: 'center',
                        padding: '1rem',
                        background: '#fefefe',
                        transition: 'all 0.2s ease'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                          e.currentTarget.style.borderColor = '#1779ba';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = '#e6e6e6';
                        }}
                      >
                        <FaHome style={{ fontSize: '1.5rem', color: '#1779ba', marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a0a0a', marginBottom: '0.375rem' }}>
                          {listing?.lb} m²
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#767676', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                          Building Area
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {listing?.description && (
            <div className="grid-x grid-margin-x" style={{ marginTop: '1.5rem' }}>
              <div className="cell small-12">
                <div className="card" style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                  <div className="card-divider" style={{ 
                    background: 'linear-gradient(135deg, #1779ba 0%, #14679e 100%)',
                    color: '#fefefe',
                    padding: '0.875rem 1.25rem',
                    borderRadius: '12px 12px 0 0'
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>Description</h3>
                  </div>
                  <div className="card-section" style={{ padding: '1.25rem' }}>
                    <div style={{
                      whiteSpace: 'pre-line',
                      fontSize: '0.9375rem',
                      fontWeight: 400,
                      color: '#4a4a4a',
                      lineHeight: 1.7,
                      letterSpacing: '0.01em'
                    }}>
                      {listing.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </FoundationWrapper>

      {/* Delete Confirmation Dialog - PrimeReact */}
      <Dialog
        visible={showDeleteConfirm}
        onHide={cancelDelete}
        header="Confirm Delete"
        modal
        style={{ width: '450px' }}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={cancelDelete}
              className="p-button-text"
            />
            <Button
              label="Delete"
              icon="pi pi-trash"
              onClick={confirmDelete}
              className="p-button-danger"
              autoFocus
            />
          </div>
        }
      >
        <div className="confirmation-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem', color: '#ef4444' }} />
            <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>Are you sure you want to delete this property?</span>
          </div>
          <p style={{ color: '#6c757d', margin: 0, paddingLeft: '3rem' }}>
            This action will permanently delete the property and cannot be undone.
          </p>
        </div>
      </Dialog>
    </>
  );
}
