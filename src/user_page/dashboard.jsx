import React, { useState, useEffect } from "react";
import { FaBed, FaBath } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { getOrCreateProfile } from '../utils/profileUtils';
import CustomDropdown from "../components/CustomDropdown";

function formatIDR(price) {
  if (price === 0) return 'IDR 0';
  if (!price || isNaN(Number(price))) return '-';
  return 'IDR ' + Number(price).toLocaleString('id-ID');
}

// Helper function to get display name from owner field
function getOwnerName(owner) {
  return owner || 'Unknown Owner';
}

function Dashboard({ user }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedProvince, setSelectedProvince] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentName, setAgentName] = useState("");
  const [priceRange, setPriceRange] = useState([0, 20_000_000_000]); // 0 to 20 M
  const [priceInputs, setPriceInputs] = useState(['0', '20,000,000,000']); // For text inputs
  const [ltMin, setLtMin] = useState(null);
  const [ltMax, setLtMax] = useState(null);
  const [lbMin, setLbMin] = useState(null);
  const [lbMax, setLbMax] = useState(null);
  const [selectedKM, setSelectedKM] = useState("All");
  const [selectedKT, setSelectedKT] = useState("All");
  const [selectedOwner, setSelectedOwner] = useState("All");
  const propertyTypes = ["Rumah", "Kavling", "Apartemen"];
  const transactionTypes = ["Jual", "Sewa"];
  const [selectedTransactionType, setSelectedTransactionType] = useState("All");
  // Pagination state (max 30 cards per page)
  const ITEMS_PER_PAGE = 30;
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: "",
    selectedType: "All",
    selectedLocation: "All",
    selectedProvince: "All",
    selectedDistrict: "All",
    priceRange: [0, 20_000_000_000],
    ltMin: null,
    ltMax: null,
    lbMin: null,
    lbMax: null,
    selectedKM: "All",
    selectedKT: "All",
    selectedOwner: "All",
    selectedTransactionType: "All"
  });

  // (Pagination calculations moved below, after filteredListings is defined)
  const [filtersOpen, setFiltersOpen] = useState(false);
  const navigate = useNavigate();
  
  // Reset to first page whenever filters are applied/changed
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);

  const applyFilters = () => {
    setAppliedFilters({
      searchTerm,
      selectedType,
      selectedLocation,
      selectedProvince,
      selectedDistrict,
      priceRange,
      ltMin,
      ltMax,
      lbMin,
      lbMax,
      selectedKM,
      selectedKT,
      selectedOwner,
      selectedTransactionType
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedType("All");
    setSelectedLocation("All");
    setSelectedProvince("All");
    setSelectedDistrict("All");
    setPriceRange([0, 20_000_000_000]);
    setPriceInputs(['0', '20,000,000,000']);
    setLtMin(null);
    setLtMax(null);
    setLbMin(null);
    setLbMax(null);
    setSelectedKM("All");
    setSelectedKT("All");
    setSelectedOwner("All");
    setSelectedTransactionType("All");
    
    // Also reset the applied filters
    setAppliedFilters({
      searchTerm: "",
      selectedType: "All",
      selectedLocation: "All",
      selectedProvince: "All",
      selectedDistrict: "All",
      priceRange: [0, 20_000_000_000],
      ltMin: null,
      ltMax: null,
      lbMin: null,
      lbMax: null,
      selectedKM: "All",
      selectedKT: "All",
      selectedOwner: "All",
      selectedTransactionType: "All"
    });
  };

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
      // This automatically handles:
      // 1. Fetching existing profile from database
      // 2. Creating new profile if it doesn't exist
      // 3. Generating name from email if needed
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
      setLoading(true);
      try {
        // Fetch listings
        const { data, error } = await supabase.from("listings").select('*');
        if (error || !data) {
          console.error('Error fetching listings:', error);
          setListings([]);
          setLoading(false);
          return;
        }

        // Map listings - use owner column directly from database
        const mapped = data.map((item) => {
          let owner = item.owner;
          if (!owner) {
            owner = 'Unknown Owner';
          } else {
            owner = String(owner).trim() || 'Unknown Owner';
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
  }, [user]);

  // Use react hooks for memoized filter values to improve performance
  const uniqueProvinces = React.useMemo(() => {
    return [...new Set(listings.map(listing => listing.province))].filter(Boolean);
  }, [listings]);
  
  const uniqueLocations = React.useMemo(() => {
    const list = selectedProvince === "All" 
      ? listings 
      : listings.filter(listing => listing.province === selectedProvince);
    return [...new Set(list.map(listing => listing.location))].filter(Boolean);
  }, [listings, selectedProvince]);
  
  const uniqueDistricts = React.useMemo(() => {
    let list = listings;
    if (selectedProvince !== "All") list = list.filter(l => l.province === selectedProvince);
    if (selectedLocation !== "All") list = list.filter(l => l.location === selectedLocation);
    return [...new Set(list.map(listing => listing.district))].filter(Boolean);
  }, [listings, selectedProvince, selectedLocation]);

  const uniqueOwners = React.useMemo(() => {
    return [...new Set(listings.map(listing => listing.owner))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'id-ID', { sensitivity: 'base' }));
  }, [listings]);

  const filteredListings = React.useMemo(() => {
    return listings.filter(listing => {
      if ((listing.title || "").trim() === "DELETED") return false;
      
      const matchesSearch = !appliedFilters.searchTerm || 
        (listing.title || "").toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()) ||
        (listing.location || "").toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()) ||
        (listing.district || "").toLowerCase().includes(appliedFilters.searchTerm.toLowerCase());
        
      const matchesType = appliedFilters.selectedType === "All" || listing.property_type === appliedFilters.selectedType;
      const matchesTransactionType = appliedFilters.selectedTransactionType === "All" || listing.transaction_type === appliedFilters.selectedTransactionType;
      const matchesLocation = appliedFilters.selectedLocation === "All" || listing.location === appliedFilters.selectedLocation;
      const matchesProvince = appliedFilters.selectedProvince === "All" || listing.province === appliedFilters.selectedProvince;
      const matchesDistrict = appliedFilters.selectedDistrict === "All" || listing.district === appliedFilters.selectedDistrict;
      const matchesOwner = appliedFilters.selectedOwner === "All" || listing.owner === appliedFilters.selectedOwner;
      
      const priceNum = Number(listing.price?.toString().replace(/[^0-9]/g, ""));
      const matchesPrice = isNaN(priceNum) || (priceNum >= appliedFilters.priceRange[0] && priceNum <= appliedFilters.priceRange[1]);
      
      const ltNum = Number(listing.lt);
      const matchesLT = isNaN(ltNum) || (
        (appliedFilters.ltMin === null || ltNum >= appliedFilters.ltMin) && 
        (appliedFilters.ltMax === null || ltNum <= appliedFilters.ltMax)
      );
      
      const lbNum = Number(listing.lb);
      const matchesLB = listing.property_type === 'Kavling' || isNaN(lbNum) || (
        (appliedFilters.lbMin === null || lbNum >= appliedFilters.lbMin) && 
        (appliedFilters.lbMax === null || lbNum <= appliedFilters.lbMax)
      );
      
      const matchesKM = listing.property_type === 'Kavling' || appliedFilters.selectedKM === "All" || String(listing.baths) === String(appliedFilters.selectedKM);
      const matchesKT = listing.property_type === 'Kavling' || appliedFilters.selectedKT === "All" || String(listing.beds) === String(appliedFilters.selectedKT);
      
      return matchesSearch && matchesType && matchesTransactionType && matchesLocation && 
             matchesProvince && matchesDistrict && matchesOwner && matchesPrice && 
             matchesLT && matchesLB && matchesKM && matchesKT;
    });
  }, [listings, appliedFilters]);

  // Pagination calculations (must be after filteredListings is defined)
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

  return (
    <div className="animate-fade-in" style={{ background: 'var(--background)', minHeight: '100vh', paddingBottom: '4rem', paddingTop: '7rem' }}>
      {/* Filter Section */}
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div className="row mb-5">
          <div className="col">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-4 mb-4">
              <div>
                <h1 className="display-4 fw-bold mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
                  {agentName ? `Welcome back, ${agentName}` : 'Welcome back'}
                </h1>
                <p className="text-secondary mb-0" style={{ fontSize: '1.1rem' }}>
                  Discover premium internal listings with Protea Realty.
                </p>
              </div>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setFiltersOpen(prev => !prev)}
                style={{ padding: '0.75rem 1.25rem' }}
              >
                <i className={`bi ${filtersOpen ? 'bi-chevron-up' : 'bi-funnel'} me-2`}></i>
                {filtersOpen ? 'Hide Filters' : 'Filter Properties'}
              </button>
            </div>
            
            {filtersOpen && (
            <div className="filter-card mb-5 animate-fade-in" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div className="card-body p-4 p-md-5">
                {/* Basic Filters */}
                <div className="row g-3 mb-4">
                  <div className="col-md-2">
                    <label className="form-label fw-semibold">Tipe Properti</label>
                    <CustomDropdown
                      value={selectedType}
                      onChange={(val) => setSelectedType(val)}
                      options={["All", ...propertyTypes]}
                      placeholder="Semua Tipe"
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-semibold">Transaksi</label>
                    <CustomDropdown
                      value={selectedTransactionType}
                      onChange={(val) => setSelectedTransactionType(val)}
                      options={["All", ...transactionTypes]}
                      placeholder="Semua"
                    />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label fw-semibold">Rentang Harga</label>
                    <div className="range-group-container">
                      <input
                        type="text"
                        className="form-control form-control-sm-range"
                        placeholder="Min Price"
                        value={priceInputs[0]}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d,]/g, '');
                          setPriceInputs([value, priceInputs[1]]);
                          const numValue = value.replace(/,/g, '') ? Number(value.replace(/,/g, '')) : 0;
                          setPriceRange([numValue, Math.max(numValue, priceRange[1])]);
                        }}
                        onBlur={(e) => {
                          const value = e.target.value.replace(/,/g, '');
                          const numValue = value ? Number(value) : 0;
                          const formattedValue = numValue.toLocaleString('id-ID');
                          setPriceInputs([formattedValue, priceInputs[1]]);
                          setPriceRange([numValue, Math.max(numValue, priceRange[1])]);
                        }}
                      />
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, flexShrink: 0 }}>—</span>
                      <input
                        type="text"
                        className="form-control form-control-sm-range"
                        placeholder="Max Price"
                        value={priceInputs[1]}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d,]/g, '');
                          setPriceInputs([priceInputs[0], value]);
                          const numValue = value.replace(/,/g, '') ? Number(value.replace(/,/g, '')) : 20_000_000_000;
                          setPriceRange([Math.min(numValue, priceRange[0]), numValue]);
                        }}
                        onBlur={(e) => {
                          const value = e.target.value.replace(/,/g, '');
                          const numValue = value ? Number(value) : 20_000_000_000;
                          const formattedValue = numValue.toLocaleString('id-ID');
                          setPriceInputs([priceInputs[0], formattedValue]);
                          setPriceRange([Math.min(numValue, priceRange[0]), numValue]);
                        }}
                      />
                    </div>
                      <small className="text-secondary">
                        {formatIDR(priceRange[0])} — {formatIDR(priceRange[1])}
                      </small>
                    </div>
                  </div>

                {/* Location Filters */}
                <div className="row g-3 mb-4">
                  <div className="col-12">
                    <h6 className="text-secondary mb-3">Filter Lokasi</h6>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Provinsi</label>
                    <CustomDropdown
                      value={selectedProvince}
                      onChange={(val) => {
                        setSelectedProvince(val);
                        // Reset dependent dropdowns when province changes
                        setSelectedLocation("All");
                        setSelectedDistrict("All");
                      }}
                      options={["All", ...uniqueProvinces]}
                      placeholder="Semua Provinsi"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Kota</label>
                    <CustomDropdown
                      value={selectedLocation}
                      onChange={(val) => {
                        setSelectedLocation(val);
                        // Reset district when city changes
                        setSelectedDistrict("All");
                      }}
                      disabled={selectedProvince === "All"}
                      options={["All", ...uniqueLocations]}
                      placeholder="Semua Kota"
                    />
                    {selectedProvince === "All" && (
                      <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                        Pilih Provinsi terlebih dahulu
                      </small>
                    )}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Kecamatan</label>
                    <CustomDropdown
                      value={selectedDistrict}
                      onChange={(val) => setSelectedDistrict(val)}
                      disabled={selectedLocation === "All" || selectedProvince === "All"}
                      options={["All", ...uniqueDistricts]}
                      placeholder="Semua Kecamatan"
                    />
                    {(selectedLocation === "All" || selectedProvince === "All") && (
                      <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                        Pilih Kota terlebih dahulu
                      </small>
                    )}
                  </div>
                </div>

                {/* Owner Filter */}
                <div className="row g-3 mb-4">
                  <div className="col-12">
                    <h6 className="text-secondary mb-3">Filter Owner</h6>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Owner Listing</label>
                    <CustomDropdown
                      value={selectedOwner}
                      onChange={(val) => setSelectedOwner(val)}
                      options={["All", ...uniqueOwners]}
                      placeholder="Semua Owner"
                    />
                  </div>
                </div>

                {/* Property Details Filters */}
                <div className="row g-3">
                  <div className="col-12">
                    <h6 className="text-secondary mb-3">Detail Properti</h6>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Luas Tanah (m²)</label>
                    <div className="range-group-container">
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={ltMin === null ? '' : ltMin}
                        onChange={e => setLtMin(e.target.value === '' ? null : Number(e.target.value))}
                        className="form-control form-control-sm-range"
                        placeholder="Min"
                      />
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, flexShrink: 0 }}>—</span>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={ltMax === null ? '' : ltMax}
                        onChange={e => setLtMax(e.target.value === '' ? null : Number(e.target.value))}
                        className="form-control form-control-sm-range"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Luas Bangunan (m²)</label>
                    <div className="range-group-container">
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={lbMin === null ? '' : lbMin}
                        onChange={e => setLbMin(e.target.value === '' ? null : Number(e.target.value))}
                        className="form-control form-control-sm-range"
                        placeholder="Min"
                      />
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, flexShrink: 0 }}>—</span>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={lbMax === null ? '' : lbMax}
                        onChange={e => setLbMax(e.target.value === '' ? null : Number(e.target.value))}
                        className="form-control form-control-sm-range"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Kamar Tidur</label>
                    <CustomDropdown
                      value={selectedKT}
                      onChange={val => setSelectedKT(val)}
                      options={["All", ...[1,2,3,4,5,6,7,8,9,10].map(n => String(n))]}
                      placeholder="Semua"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Kamar Mandi</label>
                    <CustomDropdown
                      value={selectedKM}
                      onChange={val => setSelectedKM(val)}
                      options={["All", ...[1,2,3,4,5,6,7,8,9,10].map(n => String(n))]}
                      placeholder="Semua"
                    />
                  </div>
                </div>
                
                {/* Filter Action Buttons */}
                <div className="row mt-3">
                  <div className="col-12 d-flex gap-2">
                    <button 
                      className="btn btn-primary px-4 py-2"
                      onClick={applyFilters}
                      style={{ borderRadius: '8px' }}
                    >
                      <i className="bi bi-funnel me-2"></i>
                      Terapkan Filter
                    </button>
                    <button 
                      className="btn btn-outline-secondary px-4 py-2"
                      onClick={resetFilters}
                      style={{ borderRadius: '8px' }}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Atur Ulang Filter
                    </button>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Search Section */}
        <div className="row mb-5">
          <div className="col-md-10 col-lg-8 mx-auto">
            <div className="position-relative shadow-xl" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <i className="bi bi-search position-absolute" style={{ 
                left: '1.25rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                fontSize: '1.2rem',
                zIndex: 10
              }}></i>
              <input
                type="text"
                className="form-control form-control-lg border-0 ps-5 py-4"
                placeholder="Search by title, city, or district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  paddingLeft: '3.5rem', 
                  fontSize: '1.1rem',
                }}
              />
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="row mb-4 align-items-center">
          <div className="col">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary rounded-pill py-2 px-3" style={{ fontSize: '0.9rem' }}>
                {filteredListings.length} Results
              </span>
              <span className="text-secondary" style={{ fontSize: '0.95rem' }}>
                Properties found in internal database
              </span>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="row g-4 mb-5">
          {loading ? (
            <div className="col-12 text-center" style={{ padding: '5rem 0' }}>
              <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3.5rem', height: '3.5rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-secondary h5">Fetching listings from database...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="col-12 text-center" style={{ padding: '5rem 2rem' }}>
              <div className="glass-card d-inline-block p-5" style={{ borderRadius: 'var(--radius-xl)' }}>
                <i className="bi bi-search fs-1 mb-4 d-block text-secondary"></i>
                <h3 className="text-primary mb-2">No Properties Found</h3>
                <p className="text-secondary mb-0">Try adjusting your filters or search keywords.</p>
              </div>
            </div>
          ) : paginatedListings.map((listing) => (
            <div className="col-lg-4 col-md-6" key={listing.id}>
              <div 
                className="glass-card h-100 animate-fade-in" 
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/listing/${listing.id}`)}
              >
                <div className="position-relative overflow-hidden" style={{ height: "260px" }}>
                  <img
                    src={listing.image}
                    className="w-100 h-100"
                    alt={listing.title}
                    style={{ 
                      objectFit: "cover",
                      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{ 
                    background: 'linear-gradient(to top, rgba(2, 6, 23, 0.8), transparent)' 
                  }}>
                    <span className="badge bg-primary mb-0">{listing.property_type}</span>
                  </div>
                </div>
                
                <div className="card-body p-4 d-flex flex-column">
                  <h5 className="h5 fw-bold mb-2" style={{ color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    {listing.title}
                  </h5>
                  
                  <div className="text-primary fw-bold mb-3" style={{ fontSize: '1.4rem', fontFamily: 'Outfit', letterSpacing: '-0.01em' }}>
                    {formatIDR(listing.price)}
                    {listing.property_type === 'Kavling' && <span className="text-secondary small ms-1" style={{ fontSize: '0.8rem' }}>/m²</span>}
                  </div>

                  <p className="text-secondary mb-4 small d-flex align-items-center gap-1">
                    <i className="bi bi-geo-alt text-accent"></i>
                    {listing.location}, {listing.district}
                  </p>

                  <div className="d-flex align-items-center justify-content-between py-3 border-top border-bottom" style={{ borderColor: 'var(--border) !important' }}>
                    {listing.property_type === 'Kavling' ? (
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-primary fw-bold">{listing.lt}</span>
                        <span className="text-secondary small">Total Area (m²)</span>
                      </div>
                    ) : (
                      <div className="d-flex gap-4">
                        <div className="d-flex align-items-center gap-1 text-secondary small">
                          <FaBed className="text-primary" /> <strong>{listing.beds}</strong>
                        </div>
                        <div className="d-flex align-items-center gap-1 text-secondary small">
                          <FaBath className="text-primary" /> <strong>{listing.baths}</strong>
                        </div>
                        <div className="d-flex align-items-center gap-1 text-secondary small">
                           <span className="text-primary fw-bold">LT</span> {listing.lt}
                        </div>
                        <div className="d-flex align-items-center gap-1 text-secondary small">
                           <span className="text-primary fw-bold">LB</span> {listing.lb}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 d-flex justify-content-between align-items-center">
                    <div className="small text-secondary">
                      Owner: <span className="text-secondary fw-semibold">{getOwnerName(listing.owner).split(' ')[0]}</span>
                    </div>
                    <button className="btn btn-primary py-2 px-3" style={{ fontSize: '0.85rem' }}>
                      Details <i className="bi bi-arrow-right small"></i>
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
              <span className="text-secondary" style={{ fontWeight: 500, padding: '0 1rem' }}>
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
  );
}

export default Dashboard;
