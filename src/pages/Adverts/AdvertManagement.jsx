import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash, Upload, X } from 'lucide-react';
import { uploadMedia, deleteFile } from '../../utils/supabaseStorage';
import summaryApi from '../../common';
import { useSelector } from 'react-redux';

const AdvertManagement = () => {
  const [adverts, setAdverts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    name: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [currentImagePath, setCurrentImagePath] = useState(null);
  const fileInputRef = useRef(null);
  const { currentUser } = useSelector((state)=> state.user)

  useEffect(() => {
    fetchAdverts();
  }, []);

  const fetchAdverts = async () => {
    try {
      const response = await fetch(summaryApi.adminStarAdvertGet.url, {
        method: summaryApi.adminStarAdvertGet.method,
      });

      if (!response.ok) {
        if (response.status === 404) {
          // If no adverts exist yet, just set empty array and don't show error
          setAdverts([]);
          setFetchError(null);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setAdverts(data.adverts || []);
        setFetchError(null);
      } else {
        setFetchError(data.message || 'Failed to fetch adverts');
      }
    } catch (error) {
      console.error('Error fetching adverts:', error);
      setFetchError('Unable to load adverts. You can still create new ones.');
      setAdverts([]); // Ensure adverts is an empty array rather than undefined
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    setCurrentImagePath(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let imageData = null;
      
      // Handle image upload if there's a new image
      if (formData.image) {
        // If editing and there's an existing image, delete it
        if (editingId && currentImagePath) {
          try {
            await deleteFile(currentImagePath, 'jobs-board-public');
          } catch (error) {
            console.error('Error deleting old image:', error);
            // Continue with submission even if delete fails
          }
        }
        
        // Upload new image
        try {
          imageData = await uploadMedia(formData.image, 'jobs-board-public');
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
          setLoading(false);
          return;
        }
      }

      const advertData = {
        title: formData.title,
        description: formData.description,
        name: formData.name,
        ...(imageData && {
          imageUrl: imageData.url,
          imagePath: imageData.path
        })
      };

      const url = editingId 
        ? `${summaryApi.adminStarAdvertUpdate.url}${editingId}`
        : summaryApi.adminStarAdvertCreate.url;
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(advertData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setFormData({
          title: '',
          description: '',
          name: '',
          image: null
        });
        setImagePreview(null);
        setCurrentImagePath(null);
        setEditingId(null);
        fetchAdverts();
      } else {
        throw new Error(data.message || 'Failed to save advert');
      }
    } catch (error) {
      console.error('Error submitting advert:', error);
      alert('Error saving advert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (advert) => {
    setFormData({
      title: advert.title,
      description: advert.description,
      name: advert.name,
      image: null
    });
    setImagePreview(advert.imageUrl);
    setCurrentImagePath(advert.imagePath);
    setEditingId(advert._id);
  };

  const handleDelete = async (id, imagePath) => {
    if (window.confirm('Are you sure you want to delete this advert?')) {
      try {
        // Delete image from storage if it exists
        if (imagePath) {
          try {
            await deleteFile(imagePath, 'jobs-board-public');
          } catch (error) {
            console.error('Error deleting image file:', error);
            // Continue with deletion even if image delete fails
          }
        }

        const response = await fetch(`${summaryApi.adminStarAdvertDelete.url}${id}`, {
          method: summaryApi.adminStarAdvertDelete.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          fetchAdverts();
        } else {
          throw new Error(data.message || 'Failed to delete advert');
        }
      } catch (error) {
        console.error('Error deleting advert:', error);
        alert('Error deleting advert. Please try again.');
      }
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {fetchError && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700">{fetchError}</p>
        </div>
      )}
      
      {/* Form Card */}
      <div className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 mb-8">
        <h5 className="mb-4 text-xl font-bold text-gray-900">
          {editingId ? 'Edit Advert' : 'Create New Advert'}
        </h5>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
              required
            />
          </div>
          <div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              required
            />
          </div>
          <div>
            <textarea
              rows="4"
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              required
            />
          </div>

          {/* Image Upload Section */}
          <div className="flex flex-col items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 5MB)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none disabled:opacity-50"
          >
            {loading ? 'Processing...' : editingId ? 'Update Advert' : 'Create Advert'}
          </button>
        </form>
      </div>

      {/* Adverts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adverts.map((advert) => (
          <div key={advert._id} className="w-full bg-white border border-gray-200 rounded-lg shadow">
            <div className="p-4">
              <h5 className="mb-2 text-lg font-bold text-gray-900">{advert.title}</h5>
              <div className="space-y-2">
                {advert.imageUrl && (
                  <img 
                    src={advert.imageUrl} 
                    alt={advert.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <p className="font-medium text-gray-900">{advert.name}</p>
                <p className="text-sm text-gray-600">{advert.description}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(advert)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-200"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(advert._id, advert.imagePath)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvertManagement;