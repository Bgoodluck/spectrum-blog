import React, { useState, useEffect } from 'react';
import { Card } from 'flowbite-react';

const AdvertList = () => {
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [adverts, setAdverts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMore, setShowMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchAdverts();
    }, [searchTerm, sortOrder]);

    const fetchAdverts = async (startIndex = 0) => {
        try {
            const response = await fetch(
                `${backendUrl}/api/advert/get?startIndex=${startIndex}&searchTerm=${searchTerm}&order=${sortOrder}`
            );
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }
            
            if (startIndex === 0) {
                setAdverts(data.adverts);
            } else {
                setAdverts(prev => [...prev, ...data.adverts]);
            }
            
            setShowMore(data.adverts.length >= 9);
        } catch (error) {
            setError('Failed to fetch advertisements');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShowMore = () => {
        fetchAdverts(adverts.length);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAdverts(0);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold">Advertisements</h2>
                
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search adverts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="rounded-lg border-gray-300 dark:bg-slate-600 bg-slate-300"
                        />
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
                        >
                            Search
                        </button>
                    </form>
                    
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="rounded-lg border-gray-300 dark:bg-slate-600"
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {adverts.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No advertisements found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {adverts.map((advert) => (
                        <Card key={advert._id} className="overflow-hidden">
                            <div className="flex flex-col h-full">
                                {advert.image && (
                                    <div className="relative w-full h-48 mb-4 overflow-hidden">
                                        <img 
                                            src={advert.image}
                                            alt={advert.ItemName}
                                            className="absolute w-full h-full object-cover object-center rounded-t-lg"
                                        />
                                    </div>
                                )}
                                
                                <div className="flex flex-col flex-grow">
                                    <h3 className="text-xl font-semibold">{advert.ItemName}</h3>
                                    
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
                                        
                                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                            <img 
                                                src={advert.userId.profilePicture}
                                                alt={advert.userId.userName}
                                                className="w-6 h-6 rounded-full"
                                            />
                                            <span>Posted by: {advert.userId.userName}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {showMore && (
                <div className="flex justify-center mt-4">
                    <button 
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                        onClick={handleShowMore}
                    >
                        Show More
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdvertList;