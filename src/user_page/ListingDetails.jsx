import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FaBed, FaBath } from "react-icons/fa";
import Navbar from "../components/Navbar";


function formatIDR(price) {
  if (!price || isNaN(Number(price))) return '-';
  return 'IDR ' + Number(price).toLocaleString('id-ID');
}

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [user, setUser] = useState(null);
  const [copyLoading, setCopyLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleCopyLink = async () => {
    setCopyLoading(true);
    setCopySuccess(false);
    try {
      const fullUrl = window.location.origin + `/listing/${id}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
    setCopyLoading(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    // Update in database
    await supabase.from("listings").update({ title: "DELETED" }).eq("id", id);
    // Update local state
    setIsDeleted(true);
    setListing((prev) => prev ? { ...prev, title: "DELETED" } : prev);
    setShowDeleteConfirm(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/dashboard');
    }, 1500);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Navbar title="Dashboard" showAdminButton={user && user.id === allowedUserId} />
      <div className="container mt-4 mb-5">
        <div className="d-flex mb-3 justify-content-between align-items-center">
          {/* Left group: Back, Copy Link */}
          <div className="d-flex gap-2 align-items-center">
            <button className="btn btn-secondary d-inline-flex align-items-center" onClick={() => navigate('/dashboard')}>
              <span className="me-2" style={{fontSize: '1.2em'}}>&larr;</span> Back
            </button>
            <button className="btn btn-success d-inline-flex align-items-center" onClick={handleCopyLink} disabled={copyLoading}>
              <span className="me-2" style={{fontSize: '1.2em'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-link-45deg" viewBox="0 0 16 16">
                  <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                  <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
                </svg>
              </span>
              {copyLoading ? 'Copying...' : copySuccess ? 'Link Copied!' : 'Copy Link'}
            </button>
          </div>
          {/* Right group: Edit, Delete (only for allowed users) */}
          {user && allowedUserId.includes(user.id) && (
            <div className="d-flex gap-2 align-items-center">
              <button className="btn btn-warning d-inline-flex align-items-center" onClick={() => navigate(`/edit-listing/${id}`)}>
                <span className="me-2" style={{fontSize: '1.2em'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                </svg>
                </span>
                Edit Property
              </button>
              <button className="btn btn-danger d-inline-flex align-items-center" onClick={handleDelete}>
                <span className="me-2" style={{fontSize: '1.2em'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0V6z"/>
                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
                </span>
                Delete
              </button>
            </div>
          )}
        </div>
        <div className="row">
          <div className="col-12">
            <img
              src={listing?.image}
              alt={listing?.title}
              className="img-fluid rounded shadow-sm mb-4"
              style={{ width: "100%", height: "auto", maxHeight: "600px", objectFit: "contain" }}
            />
          </div>
        </div>
        
        <div className="row">
          <div className="col-12">
            <h2 className="fw-bold mb-2">{isDeleted ? "DELETED" : listing?.title}</h2>
            <p className="text-muted mb-3">
              <i className="bi bi-geo-alt me-1"></i>
              {listing?.location}
            </p>
            <h4 className="text-primary fw-bold mb-4">{formatIDR(listing?.price)}</h4>
            
            <div className="row mb-4">
              <div className="col-md-3 col-6 mb-3">
                <div className="d-flex align-items-center">
                  <FaBed className="text-primary me-2" />
                  <div>
                    <div className="fw-bold">{listing?.beds}</div>
                    <small className="text-muted">Kamar Tidur</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <div className="d-flex align-items-center">
                  <FaBath className="text-primary me-2" />
                  <div>
                    <div className="fw-bold">{listing?.baths}</div>
                    <small className="text-muted">Kamar Mandi</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <div>
                  <div className="fw-bold">{listing?.lt} m²</div>
                  <small className="text-muted">Luas Tanah</small>
                </div>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <div>
                  <div className="fw-bold">{listing?.lb} m²</div>
                  <small className="text-muted">Luas Bangunan</small>
                </div>
              </div>
            </div>
            
            {listing?.description && (
              <div className="mt-4">
                <h5 className="fw-semibold mb-3">Deskripsi</h5>
                <div className="text-muted" style={{whiteSpace: 'pre-line'}}>{listing.description}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          {/* Backdrop */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1040,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={cancelDelete}
          >
            {/* Modal Content */}
            <div 
              className="card"
              style={{
                minWidth: '400px',
                maxWidth: '500px',
                zIndex: 1041
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Confirm Delete</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={cancelDelete}
                  style={{cursor: 'pointer'}}
                ></button>
              </div>
              <div className="card-body">
                <p>Are you sure you want to delete this property?</p>
                <p className="text-muted mb-0">This action will mark the property as deleted.</p>
              </div>
              <div className="card-footer d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={cancelDelete}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2000,
          background: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: 6,
          padding: '12px 32px',
          fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          Listing deleted successfully!
        </div>
      )}
    </>
  );
}