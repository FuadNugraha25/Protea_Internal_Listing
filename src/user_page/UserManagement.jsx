import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, full_name, email, is_admin')
      .order('name')

    if (!error) setUsers(data || [])
    setLoading(false)
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: 'var(--background)' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Kelola User
        </h2>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Daftar semua user agent terdaftar
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="skeleton-block" style={{ width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton-block" style={{ width: '40%', height: '0.9375rem', marginBottom: '0.4rem' }} />
                <div className="skeleton-block" style={{ width: '60%', height: '0.85rem' }} />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          Belum ada user terdaftar.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {users.map(user => (
            <div
              key={user.id}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.875rem',
                flexShrink: 0
              }}>
                {getInitials(user.full_name || user.name)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                    {user.full_name || user.name || '(Tanpa Nama)'}
                  </span>
                  {user.is_admin && (
                    <span style={{
                      padding: '0.15rem 0.6rem',
                      borderRadius: '20px',
                      background: 'rgba(99,102,241,0.15)',
                      border: '1px solid rgba(99,102,241,0.4)',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      Admin
                    </span>
                  )}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.1rem' }}>
                  {user.email || '-'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
