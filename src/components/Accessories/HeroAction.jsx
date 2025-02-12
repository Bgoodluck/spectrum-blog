import React, { useState, useEffect } from 'react';
import { Card, Carousel } from 'flowbite-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroAction = () => {
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchAdverts();
  }, []);

  const fetchAdverts = async () => {
    try {
      const response = await fetch(
        `${backendUrl}/api/advert/get?startIndex=0&searchTerm=&order=desc`
      );
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      setAdverts(data.adverts);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!adverts.length) {
    return null;
  }

  return (
    <div className="w-full my-8">
      <h1 className='text-center mb-4 font-semibold text-2xl'>Advertisements</h1>
      <Carousel
        slideInterval={5000}
        leftControl={
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 cursor-pointer">
            <ChevronLeft className="h-4 w-4 text-white" />
          </span>
        }
        rightControl={
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 cursor-pointer">
            <ChevronRight className="h-4 w-4 text-white" />
          </span>
        }
        indicators={true}
        className="h-64 sm:h-72"
      >
        {adverts.map((advert) => (
          <div key={advert._id} className="flex h-full px-4">
            <Card className="w-full overflow-hidden">
              <div className="flex flex-row h-full">
                {/* Image container with responsive sizing */}
                <div className="w-1/3 sm:w-2/5 relative">
                  <img
                    src={advert.image || "/api/placeholder/400/200"}
                    alt={advert.ItemName}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                {/* Content container */}
                <div className="w-2/3 sm:w-3/5 flex flex-col p-3 sm:p-4">
                  <div className="flex-grow">
                    <h5 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white truncate mb-1 sm:mb-2">
                      {advert.ItemName}
                    </h5>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-400 line-clamp-2 mb-1 sm:mb-2">
                      {advert.ItemDescription}
                    </p>
                    {advert.price && (
                      <p className="text-sm sm:text-lg font-bold text-green-600 dark:text-green-500 mb-1 sm:mb-2">
                        ${advert.price}
                      </p>
                    )}
                  </div>

                  <div className="mt-1 sm:mt-2 border-t pt-1 sm:pt-2">
                    {(advert.phone || advert.address) && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {advert.phone && <p className="truncate">Contact: {advert.phone}</p>}
                        {advert.address && <p className="truncate">Location: {advert.address}</p>}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500">
                      <img 
                        src={advert.userId?.profilePicture || "/api/placeholder/24/24"}
                        alt={advert.userId?.userName || "User"}
                        className="w-4 h-4 sm:w-6 sm:h-6 rounded-full object-cover"
                      />
                      <span className="truncate">Posted by: {advert.userId?.userName || "Anonymous"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default HeroAction;