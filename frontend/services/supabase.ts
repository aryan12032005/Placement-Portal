import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Bucket names - create these buckets in Supabase Dashboard > Storage
const BUCKET_NAME = 'resumes';
const PROFILE_PICS_BUCKET = 'profilepic';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Upload resume to Supabase Storage
export const uploadResume = async (file: File, userId: string): Promise<string | null> => {
  try {
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;

    // Upload file to Supabase Storage (directly to bucket root, no folder)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError.message);
      // Provide helpful error messages
      if (uploadError.message.includes('Bucket not found')) {
        alert(`Please create a storage bucket named "${BUCKET_NAME}" in your Supabase dashboard.\n\nGo to: Storage > New bucket > Name: ${BUCKET_NAME} > Make it Public`);
      }
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    console.log('Upload successful:', data.publicUrl);
    return data.publicUrl;
  } catch (error: any) {
    console.error('Error uploading resume:', error);
    return null;
  }
};

// Delete resume from Supabase Storage
export const deleteResume = async (resumeUrl: string): Promise<boolean> => {
  try {
    // Extract file name from URL
    const urlParts = resumeUrl.split(`/${BUCKET_NAME}/`);
    if (urlParts.length < 2) return false;
    
    const fileName = urlParts[1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting resume:', error);
    return false;
  }
};

// Upload profile picture to Supabase Storage
export const uploadProfilePicture = async (file: File, userId: string): Promise<string | null> => {
  try {
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(PROFILE_PICS_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError.message);
      if (uploadError.message.includes('Bucket not found')) {
        alert(`Please create a storage bucket named "${PROFILE_PICS_BUCKET}" in your Supabase dashboard.\n\nGo to: Storage > New bucket > Name: ${PROFILE_PICS_BUCKET} > Make it Public`);
      }
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage
      .from(PROFILE_PICS_BUCKET)
      .getPublicUrl(fileName);

    console.log('Profile picture upload successful:', data.publicUrl);
    return data.publicUrl;
  } catch (error: any) {
    console.error('Error uploading profile picture:', error);
    return null;
  }
};

// Delete profile picture from Supabase Storage
export const deleteProfilePicture = async (pictureUrl: string): Promise<boolean> => {
  try {
    // Extract file name from URL
    const urlParts = pictureUrl.split(`/${PROFILE_PICS_BUCKET}/`);
    if (urlParts.length < 2) return false;
    
    const fileName = urlParts[1];

    const { error } = await supabase.storage
      .from(PROFILE_PICS_BUCKET)
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return false;
  }
};
