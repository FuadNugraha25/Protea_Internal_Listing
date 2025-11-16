import { supabase } from '../supabaseClient';

// Function to automatically convert email to a proper name format
export function emailToName(email) {
  if (!email) return '';
  
  const emailUsername = email.split('@')[0];
  const nameParts = emailUsername
    .split(/[._-]/)
    .map(part => {
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .filter(part => part.length > 0);
  
  return nameParts.join(' ');
}

/**
 * Get or create a profile for a user
 * This function will:
 * 1. Try to get existing profile from database
 * 2. If not found, create one automatically from email
 * 3. Return the profile data
 */
export async function getOrCreateProfile(user) {
  if (!user) return null;

  try {
    // First, try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!fetchError && existingProfile) {
      return existingProfile;
    }

    // Profile doesn't exist, create it automatically
    let name = '';
    
    // Try to get name from user metadata first
    if (user.user_metadata?.name || user.user_metadata?.full_name) {
      name = user.user_metadata.name || user.user_metadata.full_name;
    } else {
      // Generate name from email
      name = emailToName(user.email);
    }

    // Create new profile
    const newProfile = {
      id: user.id,
      email: user.email,
      name: name,
      full_name: name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      // Return a fallback profile object even if database insert fails
      return {
        id: user.id,
        email: user.email,
        name: name,
        full_name: name
      };
    }

    return createdProfile;
  } catch (error) {
    console.error('Error in getOrCreateProfile:', error);
    // Return fallback profile
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.user_metadata?.full_name || emailToName(user.email),
      full_name: user.user_metadata?.name || user.user_metadata?.full_name || emailToName(user.email)
    };
  }
}

/**
 * Update profile in database
 */
export async function updateProfile(userId, profileData) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return { error };
  }
}

/**
 * Get profile by user ID
 */
export async function getProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error('Error in getProfile:', error);
    return { error };
  }
}

/**
 * Check if a user is an admin by querying their profile
 * This uses the is_admin column from the database instead of hardcoded UUIDs
 */
export async function isUserAdmin(user) {
  if (!user) return false;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      // Fallback to hardcoded list if profile doesn't exist yet
      const allowedUserIds = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136'];
      return allowedUserIds.includes(user.id);
    }

    return data.is_admin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    // Fallback to hardcoded list on error
    const allowedUserIds = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136'];
    return allowedUserIds.includes(user.id);
  }
}

