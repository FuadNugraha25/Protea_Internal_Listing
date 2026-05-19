import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../supabaseClient'

// Module-level cache — persists across re-renders in the same session
const geocodeCache = new Map()

async function geocodeCity(city, province) {
  const key = `${city}||${province}`
  if (geocodeCache.has(key)) return geocodeCache.get(key)

  // Respect Nominatim rate limit: 1 req/sec
  await new Promise(r => setTimeout(r, 1100))

  const q = [city, province, 'Indonesia'].filter(Boolean).join(', ')
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'ProteaRealtyApp/1.0' } }
    )
    const data = await res.json()
    if (data[0]) {
      const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)]
      geocodeCache.set(key, coords)
      return coords
    }
  } catch {}
  geocodeCache.set(key, null)
  return null
}

function formatPrice(price) {
  if (!price) return '-'
  const num = Number(price)
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)} M`
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(0)} jt`
  return `Rp ${num.toLocaleString('id-ID')}`
}

function createMarkerIcon(count) {
  const size = count > 9 ? 40 : 36
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:#6366f1;border:2.5px solid #fff;
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-weight:700;font-size:13px;font-family:sans-serif;
      box-shadow:0 3px 10px rgba(0,0,0,0.5);
    ">${count > 99 ? '99+' : count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)]
  })
}

export default function MapPage() {
  const [cityGroups, setCityGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [geocodingTotal, setGeocodingTotal] = useState(0)
  const [geocodingDone, setGeocodingDone] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, price, city, district, province, property_type, transaction_type')

      if (error || !data || cancelled) { setLoading(false); return }

      // Group by city + province
      const groups = {}
      data.forEach(l => {
        if (!l.city) return
        const key = `${l.city}||${l.province}`
        if (!groups[key]) groups[key] = { city: l.city, province: l.province, listings: [] }
        groups[key].listings.push(l)
      })

      const groupList = Object.values(groups)
      setLoading(false)
      setGeocodingTotal(groupList.length)
      setGeocodingDone(0)

      // Geocode sequentially, update markers progressively
      for (let i = 0; i < groupList.length; i++) {
        if (cancelled) break
        const g = groupList[i]
        const coords = await geocodeCity(g.city, g.province)
        if (!cancelled) {
          setCityGroups(prev => [...prev, { ...g, coords }])
          setGeocodingDone(i + 1)
        }
      }
    }

    setCityGroups([])
    load()
    return () => { cancelled = true }
  }, [])

  const total = cityGroups.reduce((s, g) => s + g.listings.length, 0)
  const isGeocoding = geocodingDone < geocodingTotal && geocodingTotal > 0

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--background)', paddingTop: '75px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: '1.5rem 2rem 1rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Peta Properti
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Sebaran lokasi properti terdaftar
          </p>
        </div>
        {!loading && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.5rem 1rem', textAlign: 'center', minWidth: '80px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{total}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Properti</div>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.5rem 1rem', textAlign: 'center', minWidth: '80px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{geocodingTotal}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Kota</div>
            </div>
          </div>
        )}
      </div>

      {/* Map container — flex: 1 + minHeight: 0 to fill remaining space */}
      <div style={{ flex: 1, minHeight: 0, margin: '0 2rem 2rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
        {loading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton-block" style={{ width: `${200 - i * 40}px`, height: '1rem', margin: '0 auto' }} />
              ))}
            </div>
          </div>
        ) : (
          <MapContainer
            center={[-2.5, 118]}
            zoom={5}
            style={{ position: 'absolute', inset: 0 }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {cityGroups.filter(g => g.coords).map(g => (
              <Marker
                key={`${g.city}||${g.province}`}
                position={g.coords}
                icon={createMarkerIcon(g.listings.length)}
              >
                <Popup minWidth={220} maxWidth={280}>
                  <div style={{ fontFamily: 'inherit' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem', color: '#1e293b' }}>
                      {g.city}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
                      {g.province} &bull; {g.listings.length} properti
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                      {g.listings.map(l => (
                        <div key={l.id} style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.8rem' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {l.title}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                            <span>{l.property_type} &bull; {l.transaction_type}</span>
                            <span style={{ fontWeight: 600, color: '#6366f1' }}>{formatPrice(l.price)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Geocoding progress badge */}
        {isGeocoding && (
          <div style={{
            position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(99,102,241,0.4)',
            borderRadius: '999px', padding: '0.4rem 1rem',
            color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 500,
            zIndex: 1000, whiteSpace: 'nowrap'
          }}>
            Memuat lokasi… {geocodingDone}/{geocodingTotal}
          </div>
        )}
      </div>
    </div>
  )
}
