import React, { useState, useEffect } from 'react';
import FoundationWrapper from '../components/FoundationWrapper';
import { supabase } from '../supabaseClient';
import { emailToName, getOrCreateProfile } from '../utils/profileUtils';

function formatIDR(price) {
  if (!price || isNaN(Number(price))) return '-';
  return 'IDR ' + Number(price).toLocaleString('id-ID');
}

// Helper function to get display name from profile
function getDisplayName(profile) {
  if (!profile) return 'Unknown User';
  return profile.name || profile.full_name || profile.email || 'Unknown User';
}

// Helper function to get or create profile for a user_id
// This will try to get the profile, and if it doesn't exist, try to create it
async function getOrCreateProfileForUserId(userId) {
  if (!userId) return null;
  
  try {
    // First, try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, name, full_name, email')
      .eq('id', userId)
      .single();

    if (!fetchError && existingProfile) {
      return existingProfile;
    }

    // Profile doesn't exist, try to get user info from auth
    // Note: We can't directly query auth.users from client, but we can try to get current user
    // For now, we'll try to create a profile with minimal info
    // The best solution would be to ensure profiles are created when users log in
    
    // Try to get user email from auth (if current user matches)
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (currentUser && currentUser.id === userId) {
      // This is the current user, we can create their profile
      const profile = await getOrCreateProfile(currentUser);
      return profile ? { id: profile.id, name: profile.name, full_name: profile.full_name, email: profile.email } : null;
    }

    // If we can't get user info, return null (will show as Unknown User)
    return null;
  } catch (error) {
    console.error('Error getting profile for user_id:', userId, error);
    return null;
  }
}

function ConfirmListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch listings from Supabase with user profile information
  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      try {
        // First, fetch listings
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50); // Limit to 50 most recent listings

        if (listingsError) {
          console.error('Error fetching listings:', listingsError);
          setListings([]);
          setLoading(false);
          return;
        }

        if (!listingsData || listingsData.length === 0) {
          setListings([]);
          setLoading(false);
          return;
        }

        // Get unique user IDs from listings
        const userIds = [...new Set(listingsData.map(listing => listing.user_id).filter(Boolean))];
        
        // Fetch profiles for all unique user IDs
        let profilesMap = {};
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, full_name, email')
            .in('id', userIds);

          if (!profilesError && profilesData) {
            // Create a map of user_id -> profile for easy lookup
            profilesMap = profilesData.reduce((acc, profile) => {
              acc[profile.id] = profile;
              return acc;
            }, {});
          }

          // For any user IDs that don't have profiles, try to create them
          const missingUserIds = userIds.filter(id => !profilesMap[id]);
          for (const userId of missingUserIds) {
            const profile = await getOrCreateProfileForUserId(userId);
            if (profile) {
              profilesMap[userId] = profile;
            }
          }
        }

        // Merge listings with their profiles
        const listingsWithProfiles = listingsData.map(listing => ({
          ...listing,
          profiles: listing.user_id ? profilesMap[listing.user_id] || null : null
        }));

        setListings(listingsWithProfiles);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    }

    // Initial fetch
    fetchListings();

    // Set up real-time subscription for new listings
    const channel = supabase
      .channel('listings-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'listings'
        },
        async (payload) => {
          console.log('New listing detected:', payload.new);
          // Fetch the profile for the new listing
          if (payload.new.user_id) {
            let profile = null;
            
            // Try to get existing profile
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id, name, full_name, email')
              .eq('id', payload.new.user_id)
              .single();
            
            if (existingProfile) {
              profile = existingProfile;
            } else {
              // Profile doesn't exist, try to create it
              profile = await getOrCreateProfileForUserId(payload.new.user_id);
            }
            
            const newListing = {
              ...payload.new,
              profiles: profile
            };
            
            // Add new listing to the beginning of the array
            setListings((prevListings) => {
              // Check if listing already exists to avoid duplicates
              const exists = prevListings.some(listing => listing.id === newListing.id);
              if (exists) return prevListings;
              return [newListing, ...prevListings].slice(0, 50); // Keep only 50 most recent
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'listings'
        },
        async (payload) => {
          console.log('Listing updated:', payload.new);
          // Fetch the profile for the updated listing
          let profile = null;
          if (payload.new.user_id) {
            // Try to get existing profile
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id, name, full_name, email')
              .eq('id', payload.new.user_id)
              .single();
            
            if (existingProfile) {
              profile = existingProfile;
            } else {
              // Profile doesn't exist, try to create it
              profile = await getOrCreateProfileForUserId(payload.new.user_id);
            }
          }
          
          const updatedListing = {
            ...payload.new,
            profiles: profile
          };
          
          // Update the listing in the array
          setListings((prevListings) =>
            prevListings.map((listing) =>
              listing.id === updatedListing.id ? updatedListing : listing
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'listings'
        },
        (payload) => {
          console.log('Listing deleted:', payload.old.id);
          // Remove the listing from the array
          setListings((prevListings) =>
            prevListings.filter((listing) => listing.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <FoundationWrapper style={{ paddingTop: '1.5rem', minHeight: '100vh', background: '#f8f9fa' }}>
      <div className="grid-container" style={{ maxWidth: '1400px' }}>
        {/* Header */}
        <div className="grid-x grid-margin-x" style={{ marginBottom: '2rem' }}>
          <div className="cell">
            <div className="card" style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: '10px' }}>
              <div className="card-section" style={{ padding: '1.5rem' }}>
                <h1 style={{ 
                  fontSize: '2rem', 
                  fontWeight: 700, 
                  color: '#0a0a0a',
                  margin: 0,
                  marginBottom: '0.5rem'
                }}>
                  Listingan Log
                </h1>
                <p style={{ 
                  color: '#767676', 
                  fontSize: '1rem',
                  margin: 0
                }}>
                  Log listingan yang baru diupload
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="grid-x grid-margin-x">
          <div className="cell">
            <div className="card" style={{ border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
              <div className="card-divider" style={{ 
                background: 'linear-gradient(135deg, #1779ba 0%, #14679e 100%)',
                color: '#fefefe',
                padding: '1rem 1.5rem',
                borderRadius: '12px 12px 0 0'
              }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                  Recent Uploads ({listings.length})
                </h3>
              </div>
              <div className="card-section" style={{ padding: 0 }}>
                {loading ? (
                  <div style={{ 
                    padding: '3rem', 
                    textAlign: 'center', 
                    color: '#767676' 
                  }}>
                    <p style={{ fontSize: '1.125rem', margin: 0 }}>
                      Memuat data...
                    </p>
                  </div>
                ) : listings.length === 0 ? (
                  <div style={{ 
                    padding: '3rem', 
                    textAlign: 'center', 
                    color: '#767676' 
                  }}>
                    <p style={{ fontSize: '1.125rem', margin: 0 }}>
                      Tidak ada listingan
                    </p>
                  </div>
                ) : (
                  <div style={{ padding: '1.5rem' }}>
                    {listings.map((listing, index) => (
                      <div
                        key={listing.id}
                        style={{
                          padding: '1.25rem',
                          borderBottom: index < listings.length - 1 ? '1px solid #e6e6e6' : 'none',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: '0.5rem'
                            }}>
                              <div style={{ 
                                fontWeight: 600, 
                                color: '#0a0a0a',
                                fontSize: '1.125rem'
                              }}>
                                {listing.title}
                              </div>
                            </div>
                            <div style={{ 
                              marginBottom: '0.75rem',
                              fontSize: '0.875rem',
                              color: '#767676'
                            }}>
                              <div style={{ 
                                display: 'inline-block',
                                padding: '0.25rem 0.75rem',
                                background: 'linear-gradient(135deg, #1779ba 0%, #14679e 100%)',
                                color: '#fff',
                                borderRadius: '6px',
                                fontWeight: 600,
                                marginBottom: '0.5rem',
                                fontSize: '0.8125rem'
                              }}>
                                👤 {getDisplayName(listing.profiles)}
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexWrap: 'wrap',
                              gap: '1rem',
                              marginBottom: '0.75rem',
                              fontSize: '0.875rem',
                              color: '#767676'
                            }}>
                              <span>
                                <strong>Tipe:</strong> {listing.property_type} • {listing.transaction_type}
                              </span>
                              <span>
                                <strong>Lokasi:</strong> {listing.city}, {listing.province}
                              </span>
                              <span>
                                <strong>Harga:</strong> {formatIDR(listing.price)}
                              </span>
                            </div>
                            <div style={{ 
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '1rem',
                              fontSize: '0.875rem',
                              color: '#767676'
                            }}>
                              {listing.lt && <span>LT: {listing.lt} m²</span>}
                              {listing.lb && <span>LB: {listing.lb} m²</span>}
                              {listing.kt && <span>KT: {listing.kt}</span>}
                              {listing.km && <span>KM: {listing.km}</span>}
                            </div>
                          </div>
                          <div style={{ 
                            color: '#767676',
                            fontSize: '0.875rem',
                            textAlign: 'right',
                            whiteSpace: 'nowrap'
                          }}>
                            {listing.created_at 
                              ? new Date(listing.created_at).toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '-'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FoundationWrapper>
  );
}

export default ConfirmListings;

