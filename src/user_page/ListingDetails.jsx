import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FaBed, FaBath } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { useState as useReactState } from "react";

function formatIDR(price) {
  if (!price || isNaN(Number(price))) return '-';
  return 'IDR ' + Number(price).toLocaleString('id-ID');
}

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [user, setUser] = useState(null);
  const [waLoading, setWaLoading] = useReactState(false);
  const [waError, setWaError] = useReactState(null);

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

  const handleShareWhatsApp = async () => {
    setWaLoading(true);
    setWaError(null);
    try {
      const fullUrl = window.location.origin + `/listing/${id}`;
      // Use tinyurl API to shorten
      const res = await fetch(`https://api.tinyurl.com/create`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 8f1b2e2e2e2e4b8b8b8b8b8b8b8b8b8b' // You must replace with your TinyURL API token
        },
        body: JSON.stringify({
          url: fullUrl,
          domain: 'tinyurl.com'
        })
      });
      const data = await res.json();
      const shortUrl = data.data?.tiny_url || fullUrl;
      const text = encodeURIComponent(`Cek properti ini: ${shortUrl}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    } catch {
      setWaError('Gagal membuat link pendek.');
    }
    setWaLoading(false);
  };

  return (
    <>
      <Navbar title="Dashboard" showAdminButton={user && user.id === allowedUserId} />
      <div className="container mt-4 mb-5">
        <div className="d-flex mb-3 gap-2 align-items-center">
          <button className="btn btn-secondary d-inline-flex align-items-center" onClick={() => navigate('/dashboard')}>
            <span className="me-2" style={{fontSize: '1.2em'}}>&larr;</span> Back
          </button>
          {user && allowedUserId.includes(user.id) && (
            <button className="btn btn-warning d-inline-flex align-items-center" onClick={() => navigate(`/edit-listing/${id}`)}>
              <span className="me-2" style={{fontSize: '1.2em'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                </svg>
              </span>
              Edit Property
            </button>
          )}
         <button className="btn btn-success d-inline-flex align-items-center" onClick={handleShareWhatsApp} disabled={waLoading}>
           <span className="me-2" style={{fontSize: '1.2em'}}>
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
               <path d="M13.601 2.326A7.956 7.956 0 0 0 8.002 0C3.582 0 .002 3.582.002 8c0 1.409.37 2.773 1.07 3.97L.057 16l4.13-1.08A7.963 7.963 0 0 0 8.002 16c4.418 0 8-3.582 8-8 0-1.97-.684-3.81-1.934-5.2zm-5.6 12.6c-1.2 0-2.38-.32-3.4-.92l-.24-.14-2.45.64.66-2.38-.16-.25A6.92 6.92 0 0 1 1.002 8c0-3.86 3.14-7 7-7 1.87 0 3.63.73 4.95 2.05A6.96 6.96 0 0 1 15.002 8c0 3.86-3.14 7-7 7zm3.62-5.47c-.2-.1-1.18-.58-1.36-.65-.18-.07-.31-.1-.44.1-.13.19-.5.65-.62.78-.11.13-.23.15-.43.05-.2-.1-.84-.31-1.6-.99-.59-.53-.99-1.18-1.11-1.38-.12-.2-.01-.3.09-.39.09-.09.2-.23.3-.34.1-.12.13-.2.2-.33.07-.13.04-.25-.02-.35-.06-.1-.44-1.07-.6-1.47-.16-.39-.32-.34-.44-.35-.11-.01-.24-.01-.37-.01-.13 0-.34.05-.52.25-.18.2-.7.68-.7 1.65 0 .97.72 1.91.82 2.05.1.13 1.42 2.17 3.45 2.96.48.17.85.27 1.14.34.48.1.92.09 1.27.06.39-.04 1.18-.48 1.35-.94.17-.46.17-.85.12-.94-.05-.09-.18-.13-.38-.23z"/>
             </svg>
           </span>
           {waLoading ? 'Membuat Link...' : 'Kirim ke WhatsApp'}
         </button>
         {waError && <span className="text-danger ms-2">{waError}</span>}
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
            <h2 className="fw-bold mb-2">{listing?.title}</h2>
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
    </>
  );
}