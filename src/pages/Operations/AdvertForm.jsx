import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Label, TextInput, Textarea, Card, Alert } from 'flowbite-react';
import { X } from 'lucide-react';
import summaryApi from '../../common';
import { deleteFile, uploadMedia } from '../../utils/supabaseStorage';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const AdvertForm = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const { advertId } = useParams();

    const [formData, setFormData] = useState({
        ItemName: '',
        ItemDescription: '',
        price: '',
        phone: '',
        address: '',
        note: '',
        image: ''
    });
    
    const [media, setMedia] = useState(null);
    const [mediaPreview, setMediaPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (advertId) {
            const fetchAdvert = async () => {
                try {
                    const response = await fetch(`${summaryApi.advertGet.url}`);
                    const data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(data.message || 'Failed to fetch advertisement');
                    }
                    
                    if (data.success) {
                        setFormData(data.advert);
                        if (data.advert.image) {
                            setMediaPreview(data.advert.image);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching advert:', error);
                    setError(error.message);
                }
            };
            fetchAdvert();
        }
    }, [advertId]);

    const validateFile = (file) => {
        if (file.size > MAX_FILE_SIZE) {
            throw new Error('File size should be less than 10MB');
        }

        if (!file.type.startsWith('image/')) {
            throw new Error('Please select an image file');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            validateFile(file);
            
            setError('');
            setMedia(file);
            const previewUrl = URL.createObjectURL(file);
            setMediaPreview(previewUrl);

            // Upload to Supabase
            setLoading(true);
            const onProgress = (progress) => {
                setUploadProgress(progress);
            };

            const { url, path } = await uploadMedia(file, 'jobs-board-public');
            
            setFormData(prev => ({
                ...prev,
                image: url
            }));
            
            setMedia({
                url,
                path
            });
            
        } catch (err) {
            setError(err.message);
            e.target.value = '';
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const clearMedia = () => {
        if (mediaPreview) {
            URL.revokeObjectURL(mediaPreview);
        }
        setMedia(null);
        setMediaPreview('');
        setFormData(prev => ({
            ...prev,
            image: ''
        }));
        setError('');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!currentUser?.rest?._id) {
            setError('You must be logged in to create or edit an advertisement');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const url = advertId 
                ? `${backendUrl}/api/advert/${advertId}`
                : backendUrl+'/api/advert/create';
            
            const method = advertId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({
                    ...formData,
                    userId: currentUser._id
                })
            });

            const data = await response.json();

            if (!data.success) {
                // If post creation fails and we uploaded new media, cleanup
                if (media?.path) {
                    try {
                        await deleteFile(media.path, 'jobs-board-public');
                    } catch (deleteError) {
                        console.error('Failed to cleanup media after post creation failed:', deleteError);
                    }
                }
                throw new Error(data.message || 'Something went wrong');
            }

            navigate('/advert-page');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <Card>
                <h2 className="text-2xl font-bold mb-4">
                    {advertId ? 'Edit Advertisement' : 'Create New Advertisement'}
                </h2>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="image" value="Item Image" />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                        />
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="mt-2">
                                <div className="h-2 bg-blue-200 rounded-full">
                                    <div 
                                        className="h-2 bg-blue-600 rounded-full"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        {mediaPreview && (
                            <div className="relative inline-block mt-2">
                                <img 
                                    src={mediaPreview} 
                                    alt="Item preview" 
                                    className="max-h-40 rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={clearMedia}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="ItemName" value="Item Name" />
                        <TextInput
                            id="ItemName"
                            value={formData.ItemName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="ItemDescription" value="Description" />
                        <Textarea
                            id="ItemDescription"
                            value={formData.ItemDescription}
                            onChange={handleChange}
                            required
                            rows={4}
                        />
                    </div>

                    <div>
                        <Label htmlFor="price" value="Price" />
                        <TextInput
                            id="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Enter price"
                        />
                    </div>

                    <div>
                        <Label htmlFor="phone" value="Contact Phone" />
                        <TextInput
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            type="tel"
                        />
                    </div>

                    <div>
                        <Label htmlFor="address" value="Address" />
                        <TextInput
                            id="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <Label htmlFor="note" value="Additional Notes" />
                        <Textarea
                            id="note"
                            value={formData.note}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    {error && (
                        <Alert color="failure">
                            {error}
                        </Alert>
                    )}

                    <Button 
                        type="submit" 
                        gradientDuoTone="purpleToBlue"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (advertId ? 'Update Advertisement' : 'Create Advertisement')}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default AdvertForm;