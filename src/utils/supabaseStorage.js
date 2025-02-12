import summaryApi from '../common'
import { supabase } from '../helpers/supabase-config'


export const uploadFile = async (file, bucket, folder = '') => {
  try {
    // Create a unique file name to avoid conflicts
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return { path: data.path, url: publicUrl }
  } catch (error) {
    console.error('Error uploading file:', error.message)
    throw error
  }
}


export const uploadMedia = async (file, bucket) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    
    // Determine folder based on file type
    const folder = file.type.startsWith('image/') ? 'images' : 'videos';
    const filePath = `${folder}/${fileName}`;

    // Upload with appropriate settings based on file type
    const options = {
      cacheControl: '3600',
      upsert: false
    };

    // Add video-specific options if needed
    if (file.type.startsWith('video/')) {
      options.contentType = file.type;
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, options);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { 
      path: data.path, 
      url: publicUrl, 
      type: file.type.startsWith('image/') ? 'image' : 'video'
    };
  } catch (error) {
    console.error('Error uploading media:', error.message);
    throw error;
  }
};

// Optional: Create a unified upload function that handles both cases
export const upload = async (file, bucket, options = {}) => {
  const { folder = '', type = 'file' } = options;
  
  if (type === 'media') {
    return uploadMedia(file, bucket);
  }
  
  return uploadFile(file, bucket, folder);
};



export const updateProfilePicture = async (file, currentUser, dispatch) => {
  try {
    // Upload image to Supabase
    const { url: newImageUrl } = await uploadFile(file, 'jobs-board-public', 'profiles');

    // Update the backend with new profile picture URL
    const response = await fetch(summaryApi.updateUserProfile.url, {
      method: summaryApi.updateUserProfile.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.token}`
      },
      body: JSON.stringify({
        profilePicture: newImageUrl
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Update Redux state with new profile picture
      dispatch(signInSuccess({
        ...currentUser,
        rest: {
          ...currentUser.rest,
          profilePicture: newImageUrl
        }
      }));
      return newImageUrl;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error updating profile picture:', error);
    throw error;
  }
};





export const deleteFile = async (path, bucket) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting file:', error.message)
    throw error
  }
}