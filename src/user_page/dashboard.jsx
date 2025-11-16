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
  const [selectedProvince, setSelectedProvince] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 20_000_000_000]); // 0 to 20 M
  const [priceInputs, setPriceInputs] = useState(['0', '20,000,000,000']); // For text inputs
  const [ltMin, setLtMin] = useState(null);
  const [ltMax, setLtMax] = useState(null);
  const [lbMin, setLbMin] = useState(null);
  const [lbMax, setLbMax] = useState(null);
  const [selectedKM, setSelectedKM] = useState("All");
  const [selectedKT, setSelectedKT] = useState("All");
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
      selectedTransactionType: "All"
    });
  };

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
          province: item.province ?? "-",
          district: item.district ?? "-",
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
  const uniqueProvinces = [...new Set(listings.map(listing => listing.province))];
  
  // Filter locations based on selected province
  const uniqueLocations = selectedProvince === "All" 
    ? [...new Set(listings.map(listing => listing.location))]
    : [...new Set(listings
        .filter(listing => listing.province === selectedProvince)
        .map(listing => listing.location))];
  
  // Filter districts based on selected province and city
  const uniqueDistricts = selectedProvince === "All" && selectedLocation === "All"
    ? [...new Set(listings.map(listing => listing.district))]
    : selectedProvince !== "All" && selectedLocation === "All"
    ? [...new Set(listings
        .filter(listing => listing.province === selectedProvince)
        .map(listing => listing.district))]
    : selectedProvince === "All" && selectedLocation !== "All"
    ? [...new Set(listings
        .filter(listing => listing.location === selectedLocation)
        .map(listing => listing.district))]
    : [...new Set(listings
        .filter(listing => listing.province === selectedProvince && listing.location === selectedLocation)
        .map(listing => listing.district))];

  const filteredListings = listings.filter(listing => {
    if ((listing.title || "").trim() === "DELETED") return false;
    const matchesSearch =
      (listing.title || "").toLowerCase().includes(appliedFilters.searchTerm.toLowerCase()) ||
      (listing.location || "").toLowerCase().includes(appliedFilters.searchTerm.toLowerCase());
    const matchesType = appliedFilters.selectedType === "All" || listing.property_type === appliedFilters.selectedType;
    const matchesTransactionType = appliedFilters.selectedTransactionType === "All" || listing.transaction_type === appliedFilters.selectedTransactionType;
    const matchesLocation = appliedFilters.selectedLocation === "All" || listing.location === appliedFilters.selectedLocation;
    const matchesProvince = appliedFilters.selectedProvince === "All" || listing.province === appliedFilters.selectedProvince;
    const matchesDistrict = appliedFilters.selectedDistrict === "All" || listing.district === appliedFilters.selectedDistrict;
    // Price filter
    const priceNum = Number(listing.price?.toString().replace(/[^0-9]/g, ""));
    const matchesPrice =
      (!isNaN(priceNum) && priceNum >= appliedFilters.priceRange[0] && priceNum <= appliedFilters.priceRange[1]);
    // LT filter
    const ltNum = Number(listing.lt);
    const matchesLT =
      (!isNaN(ltNum) && (appliedFilters.ltMin === null || ltNum >= appliedFilters.ltMin) && (appliedFilters.ltMax === null || ltNum <= appliedFilters.ltMax));
    // LB filter
    const lbNum = Number(listing.lb);
    const matchesLB = listing.property_type === 'Kavling' ? true : (!isNaN(lbNum) && (appliedFilters.lbMin === null || lbNum >= appliedFilters.lbMin) && (appliedFilters.lbMax === null || lbNum <= appliedFilters.lbMax));
    // KM filter
    const matchesKM = listing.property_type === 'Kavling' ? true : (appliedFilters.selectedKM === "All" || String(listing.baths) === String(appliedFilters.selectedKM));
    // KT filter
    const matchesKT = listing.property_type === 'Kavling' ? true : (appliedFilters.selectedKT === "All" || String(listing.beds) === String(appliedFilters.selectedKT));
    
    // Debug logging for Kavling properties
    if (listing.property_type === 'Kavling') {
      console.log('Kavling property filter check:', {
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
      matchesProvince &&
      matchesDistrict &&
      matchesPrice &&
      matchesLT &&
      matchesLB &&
      matchesKM &&
      matchesKT
    );
  });

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
    <div style={{ background: 'var(--background)', minHeight: '100vh', paddingBottom: '2rem', paddingTop: '6rem' }}>
      {/* Filter Section */}
      <div className="container mb-5" style={{ marginTop: '1rem' }}>
        <div className="row mb-4">
          <div className="col">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fw-bold mb-0" style={{ color: 'var(--text-primary)', fontSize: '2rem' }}>Daftar Properti</h3>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setFiltersOpen(prev => !prev)}
                style={{ borderRadius: '8px' }}
              >
                <i className={`bi ${filtersOpen ? 'bi-chevron-up' : 'bi-chevron-down'} me-2`}></i>
                {filtersOpen ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
              </button>
            </div>
            {filtersOpen && (
            <div className="card shadow-lg" style={{ border: 'none', borderRadius: '12px' }}>
              <div className="card-body" style={{ background: 'var(--surface)' }}>
                {/* Basic Filters */}
                <div className="row g-3 mb-4">
                  <div className="col-md-2">
                    <label className="form-label fw-semibold">Tipe Properti</label>
                    <select
                      className="form-select"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      <option value="All">Semua Tipe</option>
                      {propertyTypes.map((type, idx) => (
                        <option key={idx} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-semibold">Transaksi</label>
                    <select
                      className="form-select"
                      value={selectedTransactionType}
                      onChange={(e) => setSelectedTransactionType(e.target.value)}
                    >
                      <option value="All">Semua</option>
                      {transactionTypes.map((type, idx) => (
                        <option key={idx} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-8">
                    <label className="form-label fw-semibold">Rentang Harga</label>
                    <div className="d-flex align-items-center">
                      <input
                        type="text"
                        className="form-control me-2"
                        placeholder="Harga Minimum"
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
                      <span className="mx-2">hingga</span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Harga Maksimum"
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
                      <small className="text-muted">
                        {formatIDR(priceRange[0])} - {formatIDR(priceRange[1])}
                      </small>
                    </div>
                  </div>

                {/* Location Filters */}
                <div className="row g-3 mb-4">
                  <div className="col-12">
                    <h6 className="text-muted mb-3">Filter Lokasi</h6>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Provinsi</label>
                    <select
                      className="form-select"
                      value={selectedProvince}
                      onChange={(e) => {
                        setSelectedProvince(e.target.value);
                        // Reset dependent dropdowns when province changes
                        setSelectedLocation("All");
                        setSelectedDistrict("All");
                      }}
                    >
                      <option value="All">Semua Provinsi</option>
                      {uniqueProvinces.map((province, index) => (
                        <option key={index} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Kota</label>
                    <select
                      className="form-select"
                      value={selectedLocation}
                      onChange={(e) => {
                        setSelectedLocation(e.target.value);
                        // Reset district when city changes
                        setSelectedDistrict("All");
                      }}
                      disabled={selectedProvince === "All"}
                      style={{
                        opacity: selectedProvince === "All" ? 0.6 : 1,
                        cursor: selectedProvince === "All" ? "not-allowed" : "pointer"
                      }}
                    >
                      <option value="All">Semua Kota</option>
                      {uniqueLocations.map((location, index) => (
                        <option key={index} value={location}>{location}</option>
                      ))}
                    </select>
                    {selectedProvince === "All" && (
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Pilih Provinsi terlebih dahulu
                      </small>
                    )}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Kecamatan</label>
                    <select
                      className="form-select"
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      disabled={selectedLocation === "All" || selectedProvince === "All"}
                      style={{
                        opacity: (selectedLocation === "All" || selectedProvince === "All") ? 0.6 : 1,
                        cursor: (selectedLocation === "All" || selectedProvince === "All") ? "not-allowed" : "pointer"
                      }}
                    >
                      <option value="All">Semua Kecamatan</option>
                      {uniqueDistricts.map((district, index) => (
                        <option key={index} value={district}>{district}</option>
                      ))}
                    </select>
                    {(selectedLocation === "All" || selectedProvince === "All") && (
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Pilih Kota terlebih dahulu
                      </small>
                    )}
                  </div>
                </div>

                {/* Property Details Filters */}
                <div className="row g-3">
                  <div className="col-12">
                    <h6 className="text-muted mb-3">Detail Properti</h6>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-semibold">Luas Tanah (m²)</label>
                    <div className="d-flex align-items-center">
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={ltMin === null ? '' : ltMin}
                        onChange={e => setLtMin(e.target.value === '' ? null : Number(e.target.value))}
                        className="form-control me-1"
                        placeholder="Minimum"
                      />
                      <span className="mx-1">-</span>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={ltMax === null ? '' : ltMax}
                        onChange={e => setLtMax(e.target.value === '' ? null : Number(e.target.value))}
                        className="form-control"
                        placeholder="Maksimum"
                      />
                    </div>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-semibold">Luas Bangunan (m²)</label>
                    <div className="d-flex align-items-center">
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={lbMin === null ? '' : lbMin}
                        onChange={e => setLbMin(e.target.value === '' ? null : Number(e.target.value))}
                        className="form-control me-1"
                        placeholder="Minimum"
                      />
                      <span className="mx-1">-</span>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={lbMax === null ? '' : lbMax}
                        onChange={e => setLbMax(e.target.value === '' ? null : Number(e.target.value))}
                        className="form-control"
                        placeholder="Maksimum"
                      />
                    </div>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-semibold">Kamar Tidur</label>
                    <select
                      className="form-select"
                      value={selectedKT}
                      onChange={e => setSelectedKT(e.target.value)}
                    >
                      <option value="All">Semua</option>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-semibold">Kamar Mandi</label>
                    <select
                      className="form-select"
                      value={selectedKM}
                      onChange={e => setSelectedKM(e.target.value)}
                    >
                      <option value="All">Semua</option>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
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
        <div className="row mb-4">
          <div className="col-md-8 mx-auto">
            <div className="position-relative">
              <i className="bi bi-search position-absolute" style={{ 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
                fontSize: '1.1rem'
              }}></i>
              <input
                type="text"
                className="form-control"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.75rem', borderRadius: '10px' }}
              />
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="row mb-4">
          <div className="col">
            <p className="text-muted mb-0" style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
              <i className="bi bi-house-door me-2"></i>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredListings.length}</strong> properties
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
              <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>Loading properties...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center" style={{ padding: '3rem', color: 'var(--text-secondary)' }}>
              <i className="bi bi-inbox fs-1 mb-3 d-block" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}></i>
              <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>No properties found.</p>
              <p style={{ fontSize: '0.875rem' }}>Try adjusting your filters or search terms.</p>
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
                  <div className="position-absolute top-0 start-0 m-3">
                    {/* <span className="badge bg-success">{listing.status}</span> */}
                  </div>
                  <div className="position-absolute top-0 end-0 m-3">
                    {/* <span className="badge bg-primary">{listing.type}</span> */}
                  </div>
                </div>
                <div className="card-body" style={{ padding: '1.25rem' }}>
                  <h5 className="card-title fw-bold mb-2" style={{ color: 'var(--text-primary)', fontSize: '1.125rem' }}>{listing.title}</h5>
                  <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>
                    <i className="bi bi-geo-alt me-1" style={{ color: 'var(--primary-color)' }}></i>
                    {listing.location}
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
  );
}

export default Dashboard;
