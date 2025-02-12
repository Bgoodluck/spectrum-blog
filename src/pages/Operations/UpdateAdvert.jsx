import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, Button, Modal } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

const UpdateAdvert = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const { currentUser } = useSelector((state) => state.user);
    const [userAdverts, setUserAdverts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [advertToDelete, setAdvertToDelete] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc');
    const [startIndex, setStartIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 9;

    useEffect(() => {
        if (currentUser?.rest?._id) {
            setStartIndex(0);
            setUserAdverts([]);
            fetchUserAdverts();
        }
    }, [currentUser, sortOrder]);

    const fetchUserAdverts = async () => {
        try {
            // If user is admin, fetch all adverts, otherwise fetch only user's adverts
            const endpoint = currentUser?.rest?.isAdmin 
                ? `${backendUrl}/api/advert/get?startIndex=${startIndex}&limit=${ITEMS_PER_PAGE}&order=${sortOrder}`
                : `${backendUrl}/api/advert/advert/user?startIndex=${startIndex}&limit=${ITEMS_PER_PAGE}&order=${sortOrder}`;

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }
            
            setUserAdverts(prevAdverts => 
                startIndex === 0 ? data.adverts : [...prevAdverts, ...data.adverts]
            );
            setHasMore(data.hasMore);
            
        } catch (error) {
            setError('Failed to fetch advertisements');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (hasMore) {
            setStartIndex(prevIndex => prevIndex + ITEMS_PER_PAGE);
            fetchUserAdverts();
        }
    };

    const canEditDelete = (advert) => {
        if (currentUser?.rest?.isAdmin) return true;
        if (currentUser?.rest?.isVip) {
            return advert.userId._id === currentUser.rest._id;
        }
        return false;
    };

    const handleDelete = async () => {
        if (!advertToDelete) return;

        try {
            const response = await fetch(`${backendUrl}/api/advert/delete/${advertToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser?.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setUserAdverts(userAdverts.filter(advert => advert._id !== advertToDelete._id));
                setShowModal(false);
                setAdvertToDelete(null);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error deleting advert:', error);
            setError('Failed to delete advertisement');
        }
    };




    if (loading && startIndex === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

     return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold">
                    {currentUser?.rest?.isAdmin ? 'Manage All Advertisements' : 'Manage Your Advertisements'}
                </h2>
                
                <div className="flex gap-4 items-center">
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="rounded-lg border-gray-300"
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                    
                    <Link to="/advert">
                        <Button gradientDuoTone="purpleToBlue">
                            Create New Advertisement
                        </Button>
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {userAdverts.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No advertisements found</p>
                    <Link to="/create-advert">
                        <Button className="mt-4" gradientDuoTone="purpleToBlue">
                            Create Your First Advertisement
                        </Button>
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userAdverts.map((advert) => (
                            <Card key={advert._id}>
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-semibold">{advert.ItemName}</h3>
                                            {currentUser?.rest?.isAdmin && (
                                                <p className="text-sm text-gray-500">
                                                    Posted by: {advert.userId.userName}
                                                </p>
                                            )}
                                        </div>
                                        {canEditDelete(advert) && (
                                            <div className="flex items-center gap-2">
                                                <Link to={`/edit-advert/${advert._id}`}>
                                                    <Button size="xs" color="gray">
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    size="xs" 
                                                    color="failure"
                                                    onClick={() => {
                                                        setAdvertToDelete(advert);
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {advert.image && (
                                        <img 
                                            src={advert.image}
                                            alt={advert.ItemName}
                                            className="w-full h-48 object-cover rounded-lg mt-2"
                                        />
                                    )}
                                    
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                                        {advert.ItemDescription}
                                    </p>
                                    
                                    {advert.price && (
                                        <p className="text-lg font-semibold text-green-600 mt-2">
                                            Price: ${advert.price}
                                        </p>
                                    )}
                                    
                                    <div className="mt-auto pt-4">
                                        {(advert.phone || advert.address) && (
                                            <div className="text-sm text-gray-500">
                                                {advert.phone && <p>Contact: {advert.phone}</p>}
                                                {advert.address && <p>Location: {advert.address}</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                    
                    {hasMore && (
                        <div className="flex justify-center mt-6">
                            <Button
                                onClick={loadMore}
                                disabled={loading}
                                gradientDuoTone="purpleToBlue"
                            >
                                {loading ? 'Loading...' : 'Load More'}
                            </Button>
                        </div>
                    )}
                </>
            )}

            <Modal show={showModal} onClose={() => setShowModal(false)} popup size="md">
                <Modal.Header />
                <Modal.Body>
                    <div className="text-center">
                        <HiOutlineExclamationCircle className="w-14 h-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
                        <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete this advertisement?
                        </h3>
                        <div className="flex justify-center gap-4">
                            <Button color="failure" onClick={handleDelete}>
                                Yes, delete it
                            </Button>
                            <Button color="gray" onClick={() => setShowModal(false)}>
                                No, cancel
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default UpdateAdvert;