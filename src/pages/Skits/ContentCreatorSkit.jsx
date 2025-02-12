import React, { useState, useEffect } from 'react';
import {  Trash2, Upload, Edit2, X } from 'lucide-react';
import summaryApi from '../../common';
import { useSelector } from 'react-redux';
import { upload, deleteFile } from '../../utils/supabaseStorage';

function ContentCreatorSkit() {
  const [skits, setSkits] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    fetchSkits();
  }, []);

  const fetchSkits = async () => {
    try {
      const response = await fetch(summaryApi.skitAllGet.url);
      const data = await response.json();
      setSkits(data.filter(skit => skit.uploadedBy._id === `${currentUser.rest._id}`));
    } catch (error) {
      console.error('Error fetching skits:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    if (!currentUser?.token) {
        alert('Please log in to upload skits');
        return;
      }
    
    try {
      // Upload video to Supabase using the upload utility
      const { url: videoUrl, path: videoPath } = await upload(file, 'jobs-board-public', {
        type: 'media'
      });
      
      const response = await fetch(summaryApi.skitCreation.url, {
        method: summaryApi.skitCreation.method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser?.token}`
          },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          videoUrl,
          videoPath // Store the path for future deletion if needed
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create skit');
      }

      await fetchSkits();
      setFormData({ title: '', description: '' });
      setFile(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };



  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this skit?')) {
      try {
        // Find the skit to get its video path
        const skit = skits.find(s => s._id === id);
        if (!skit) return;

        // Delete the video file from Supabase
        if (skit.videoPath) {
          await deleteFile(skit.videoPath, 'jobs-board-public');
        }

        // Delete the skit record from your backend
        const response = await fetch(`${summaryApi.skitDelete.url}${id}`, {
          method: summaryApi.skitDelete.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete skit');
        }

        await fetchSkits();
      } catch (error) {
        console.error('Error deleting skit:', error);
        alert('Failed to delete skit. Please try again.');
      }
    }
  };


  const handleEdit = async (id) => {
    if (editingId === id) {
      try {
        const response = await fetch(`${summaryApi.skitUpdate.url}${id}`, {
          method: summaryApi.skitUpdate.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error('Failed to update skit');
        }

        setEditingId(null);
        await fetchSkits();
      } catch (error) {
        console.error('Error updating skit:', error);
        alert('Failed to update skit. Please try again.');
      }
    } else {
      const skit = skits.find(s => s._id === id);
      setFormData({
        title: skit.title,
        description: skit.description
      });
      setEditingId(id);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Admin Skit Manager</h2>
      
      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium dark:text-gray-300">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium dark:text-gray-300">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-blue-500"
            rows="3"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 text-blue-500 rounded-lg border border-blue-500 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700">
            <Upload className="w-5 h-5 mr-2" />
            Choose Video
            <input
              type="file"
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
            />
          </label>
          {file && (
            <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              {file.name}
              <X
                className="w-4 h-4 ml-2 cursor-pointer"
                onClick={() => setFile(null)}
              />
            </span>
          )}
        </div>
        
        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600"
        >
          {uploading ? 'Uploading...' : 'Upload Skit'}
        </button>
      </form>

      {/* Skits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skits.map((skit) => (
          <div key={skit._id} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 shadow">
            <video
              src={skit.videoUrl}
              className="w-full h-48 object-cover rounded-lg mb-4"
              controls
            />
            
            {editingId === skit._id ? (
              <div className="space-y-2 mb-4">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white"
                />
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white"
                  rows="2"
                />
              </div>
            ) : (
              <div className="mb-4">
                <h3 className="font-bold text-lg dark:text-white">{skit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{skit.description}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleEdit(skit._id)}
                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(skit._id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default ContentCreatorSkit;