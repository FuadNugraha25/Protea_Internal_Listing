import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../supabaseClient'

function formatPrice(price) {
  if (!price) return '-'
  const num = Number(price)
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)} M`
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(0)} jt`
  return `Rp ${num.toLocaleString('id-ID')}`
}

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:36px;height:36px;border-radius:50%;
    background:#6366f1;border:2.5px solid #fff;
    display:flex;align-items:center;justify-content:center;
    color:#fff;font-weight:700;font-size:13px;font-family:sans-serif;
    box-shadow:0 3px 10px rgba(0,0,0,0.5);
  ">1</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -22]
})

function MarkersList({ markers }) {
  const map = useMap()
  return (
    <MarkerClusterGroup iconCreateFunction={createClusterIcon} chunkedLoading>
      {markers.map(m => (
        <Marker
          key={m.id}
          position={m.coords}
          icon={pinIcon}
          eventHandlers={{
            click: () => map.flyTo(m.coords, Math.max(map.getZoom(), 16), { animate: true, duration: 0.8 }),
          }}
        >
          <Popup minWidth={220} maxWidth={280}>
            <div style={{ fontFamily: 'inherit' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem', color: '#1e293b' }}>
                {m.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                {m.city}, {m.province}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#64748b' }}>{m.property_type} &bull; {m.transaction_type}</span>
                <span style={{ fontWeight: 700, color: '#6366f1' }}>{formatPrice(m.price)}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  )
}

function createClusterIcon(cluster) {
  const count = cluster.getChildCount()
  const size = count > 99 ? 44 : count > 9 ? 40 : 36
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
  })
}

export default function MapPage() {
  const [markers, setMarkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalListings, setTotalListings] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, price, city, district, province, property_type, transaction_type, latitude, longitude')

      if (error || !data) { setLoading(false); return }

      setTotalListings(data.length)

      const mapped = data
        .filter(l => l.latitude != null && l.longitude != null)
        .map(l => ({
          id: l.id,
          title: l.title,
          price: l.price,
          property_type: l.property_type,
          transaction_type: l.transaction_type,
          city: l.city,
          province: l.province,
          coords: [l.latitude, l.longitude],
        }))

      setMarkers(mapped)
      setLoading(false)
    }

    load()
  }, [])

  const withoutCoords = totalListings - markers.length

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--background)', paddingTop: '75px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: '1.5rem 2rem 1rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Property Map
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Location of all registered properties
          </p>
        </div>
        {!loading && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.5rem 1rem', textAlign: 'center', minWidth: '80px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{markers.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mapped</div>
            </div>
            {withoutCoords > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.5rem 1rem', textAlign: 'center', minWidth: '80px' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{withoutCoords}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>No coordinates</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map */}
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
            <MarkersList markers={markers} />
          </MapContainer>
        )}

        {!loading && markers.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface)', flexDirection: 'column', gap: '0.5rem'
          }}>
            <i className="bi bi-geo-alt" style={{ fontSize: '2.5rem', color: 'var(--text-secondary)' }}></i>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No properties with coordinates yet.</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Add coordinates when creating or editing a listing.</p>
          </div>
        )}
      </div>
    </div>
  )
}
