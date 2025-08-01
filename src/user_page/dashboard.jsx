import React, { useState, useEffect } from "react";
import { FaBed, FaBath } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

function formatIDR(price) {
  if (!price || isNaN(Number(price))) return '-';
  return 'IDR ' + Number(price).toLocaleString('id-ID');
}

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([500_000, 20_000_000_000]); // 100 juta to 20 M
  const [ltMin, setLtMin] = useState(null);
  const [ltMax, setLtMax] = useState(null);
  const [lbMin, setLbMin] = useState(null);
  const [lbMax, setLbMax] = useState(null);
  const [selectedKM, setSelectedKM] = useState("All");
  const [selectedKT, setSelectedKT] = useState("All");
  const propertyTypes = ["Rumah", "Tanah", "Apartemen"];
  const transactionTypes = ["Jual", "Sewa"];
  const [selectedTransactionType, setSelectedTransactionType] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      const { data, error } = await supabase.from("listings").select();
      if (error || !data) {
        setListings([]);
      } else {
        const mapped = data.map((item) => ({
          ...item,
          image: item.image_urls,
          beds: item.kt ?? item.beds ?? null,
          baths: item.km ?? item.baths ?? null,
          lt: item.lt ?? null,
          lb: item.lb ?? null,
          type: item.type ?? "-",
          status: item.status ?? "-",
          location: item.city ?? item.location ?? "-",
          price: item.price || "-",
        }));
        setListings(mapped);
      }
      setLoading(false);
    }
    // If you want to fetch from Supabase, uncomment below and remove the manual setState above
    // async function fetchPropertyTypes() {
    //   const { data, error } = await supabase.from("property_type").select();
    //   if (!error && data) {
    //     setPropertyTypes(data.map(pt => pt.property_type));
    //   }
    // }
    // async function fetchTransactionTypes() {
    //   const { data, error } = await supabase.from("transaction_type").select();
    //   if (!error && data) {
    //     setTransactionTypes(data.map(tt => tt.transaction_type));
    //   }
    // }
    // fetchPropertyTypes();
    // fetchTransactionTypes();
    fetchListings();
  }, []);

  // Extract unique locations from the data
  const uniqueLocations = [...new Set(listings.map(listing => listing.location))];

  const filteredListings = listings.filter(listing => {
    const matchesSearch =
      (listing.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (listing.location || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "All" || listing.property_type === selectedType;
    const matchesTransactionType = selectedTransactionType === "All" || listing.transaction_type === selectedTransactionType;
    const matchesLocation = selectedLocation === "All" || listing.location === selectedLocation;
    // Price filter
    const priceNum = Number(listing.price?.toString().replace(/[^0-9]/g, ""));
    const matchesPrice =
      (!isNaN(priceNum) && priceNum >= priceRange[0] && priceNum <= priceRange[1]);
    // LT filter
    const ltNum = Number(listing.lt);
    const matchesLT =
      (!isNaN(ltNum) && (ltMin === null || ltNum >= ltMin) && (ltMax === null || ltNum <= ltMax));
    // LB filter
    const lbNum = Number(listing.lb);
    const matchesLB = listing.property_type === 'Tanah' ? true : (!isNaN(lbNum) && (lbMin === null || lbNum >= lbMin) && (lbMax === null || lbNum <= lbMax));
    // KM filter
    const matchesKM = listing.property_type === 'Tanah' ? true : (selectedKM === "All" || String(listing.baths) === String(selectedKM));
    // KT filter
    const matchesKT = listing.property_type === 'Tanah' ? true : (selectedKT === "All" || String(listing.beds) === String(selectedKT));
    
    // Debug logging for Tanah properties
    if (listing.property_type === 'Tanah') {
      console.log('Tanah property filter check:', {
        title: listing.title,
        matchesSearch,
        matchesType,
        matchesTransactionType,
        matchesLocation,
        price: listing.price,
        priceNum,
        matchesPrice,
        lt: listing.lt,
        ltNum,
        matchesLT,
        matchesLB,
        matchesKM,
        matchesKT
      });
    }
    
    return (
      matchesSearch &&
      matchesType &&
      matchesTransactionType &&
      matchesLocation &&
      matchesPrice &&
      matchesLT &&
      matchesLB &&
      matchesKM &&
      matchesKT
    );
  });

  return (
    <div>
      {/* Filter Section */}
      <div className="container mt-4 mb-5">
        <div className="row mb-4">
          <div className="col">
            <h3 className="fw-bold mb-3">Property Listings</h3>
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Search</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by property name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-semibold">Location</label>
                    <select
                      className="form-select"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      <option value="All">All Locations</option>
                      {uniqueLocations.map((location, index) => (
                        <option key={index} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Property Type</label>
                    <select
                      className="form-select"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      <option value="All">All Types</option>
                      {propertyTypes.map((type, idx) => (
                        <option key={idx} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Transaction Type</label>
                    <select
                      className="form-select"
                      value={selectedTransactionType}
                      onChange={(e) => setSelectedTransactionType(e.target.value)}
                    >
                      <option value="All">All Transactions</option>
                      {transactionTypes.map((type, idx) => (
                        <option key={idx} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  {/* Price Range Slider */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Price (IDR)</label>
                    <div className="d-flex align-items-center">
                      <input
                        type="range"
                        min={100_000_000}
                        max={20_000_000_000}
                        step={100_000_000}
                        value={priceRange[0]}
                        onChange={e => setPriceRange([Number(e.target.value), Math.max(Number(e.target.value), priceRange[1])])}
                        className="form-range me-2"
                      />
                      <input
                        type="range"
                        min={100_000_000}
                        max={20_000_000_000}
                        step={100_000_000}
                        value={priceRange[1]}
                        onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[0]), Number(e.target.value)])}
                        className="form-range"
                      />
                    </div>
                    <div>
                      <small>
                        {formatIDR(priceRange[0])} - {formatIDR(priceRange[1])}
                      </small>
                    </div>
                  </div>
                  {/* LT Textboxes */}
                  <div className="col-md-2">
                    <label className="form-label fw-semibold">LT (m²)</label>
                    <div className="d-flex align-items-center">
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={ltMin === null ? '' : ltMin}
                        onChange={e => setLtMin(e.target.value === '' ? null : Number(e.target.value))}
                        className="form-control me-2"
                        placeholder="Min"
                      />
                      <span className="mx-1">-</span>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={ltMax === null ? '' : ltMax}
                        onChange={e => setLtMax(e.target.value === '' ? null : Number(e.target.value))}
                        className="form-control"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                  {/* LB Textboxes */}
                  <div className="col-md-2">
                    <label className="form-label fw-semibold">LB (m²)</label>
                    <div className="d-flex align-items-center">
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={lbMin === null ? '' : lbMin}
                        onChange={e => setLbMin(e.target.value === '' ? null : Number(e.target.value))}
                        className="form-control me-2"
                        placeholder="Min"
                      />
                      <span className="mx-1">-</span>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={lbMax === null ? '' : lbMax}
                        onChange={e => setLbMax(e.target.value === '' ? null : Number(e.target.value))}
                        className="form-control"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                  {/* KM Dropdown */}
                  <div className="col-md-2">
                    <label className="form-label fw-semibold">KM (Baths)</label>
                    <select
                      className="form-select"
                      value={selectedKM}
                      onChange={e => setSelectedKM(e.target.value)}
                    >
                      <option value="All">All</option>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  {/* KT Dropdown */}
                  <div className="col-md-2">
                    <label className="form-label fw-semibold">KT (Beds)</label>
                    <select
                      className="form-select"
                      value={selectedKT}
                      onChange={e => setSelectedKT(e.target.value)}
                    >
                      <option value="All">All</option>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="row mb-4">
          <div className="col">
            <p className="text-muted mb-0">Showing {filteredListings.length} properties</p>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="row g-4">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center">No properties found.</div>
          ) : filteredListings.map((listing) => (
            <div className="col-lg-4 col-md-6" key={listing.id}>
              <div 
                className="card h-100 border-0" 
                style={{
                  // boxShadow: 'rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px',
                  boxShadow: 'rgba(0, 0, 0, 0.16) 0px 3px 6px -1px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/listing/${listing.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = 'rgba(50, 50, 93, 0.35) 0px 8px 15px -3px, rgba(0, 0, 0, 0.4) 0px 4px 6px -2px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'rgba(0, 0, 0, 0.16) 0px 3px 6px -1px, rgba(0, 0, 0, 0.23) 0px 3px 6px';
                }}
              >
                <div className="position-relative">
                  <img
                    src={listing.image}
                    className="card-img-top"
                    alt={listing.title}
                    style={{ height: "250px", objectFit: "cover" }}
                  />
                  <div className="position-absolute top-0 start-0 m-3">
                    {/* <span className="badge bg-success">{listing.status}</span> */}
                  </div>
                  <div className="position-absolute top-0 end-0 m-3">
                    {/* <span className="badge bg-primary">{listing.type}</span> */}
                  </div>
                </div>
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-2">{listing.title}</h5>
                  <p className="text-muted mb-3">
                    <i className="bi bi-geo-alt me-1"></i>
                    {listing.location}
                  </p>
                  {listing.property_type === 'Tanah' ? (
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
                      {listing.property_type === 'Tanah' && <small className="text-muted">/m²</small>}
                      {listing.transaction_type === 'Sewa' && <small className="text-muted">/Tahun</small>}
                    </span>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => navigate(`/listing/${listing.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
