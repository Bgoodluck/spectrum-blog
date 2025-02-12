import React, { useState, useEffect } from 'react';
import summaryApi from '../../common';

const AdvertCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [adverts, setAdverts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdverts = async () => {
      try {
        const response = await fetch(summaryApi.adminStarAdvertGet.url, {
          method: summaryApi.adminStarAdvertGet.method,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setAdverts(data.adverts || []);
          setError(null);
        } else {
          setError(data.message || 'Failed to fetch adverts');
        }
      } catch (error) {
        console.error('Error fetching adverts:', error);
        setError('Unable to load adverts');
      }
    };

    fetchAdverts();
  }, []);

  useEffect(() => {
    if (adverts.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === adverts.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000); // Increased to 5 seconds

    return () => clearInterval(timer);
  }, [adverts.length]);

  const previousSlide = () => {
    setCurrentSlide((prevSlide) => 
      prevSlide === 0 ? adverts.length - 1 : prevSlide - 1
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === adverts.length - 1 ? 0 : prevSlide + 1
    );
  };

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 dark:bg-slate-800 dark:text-red-400 rounded-lg">
        {error}
      </div>
    );
  }

  if (adverts.length === 0) {
    return (
      <div className="p-4 text-gray-500 bg-gray-50 dark:bg-slate-800 dark:text-gray-400 rounded-lg">
        No advertisements available
      </div>
    );
  }

  const getSlideClasses = (index) => {
    if (index === currentSlide) {
      return 'translate-y-0 z-20 opacity-100';
    }
    if (index === (currentSlide + 1) % adverts.length) {
      return 'translate-y-full z-10 opacity-0';
    }
    return '-translate-y-full z-10 opacity-0';
  };

  return (
    <div className="relative w-full dark:bg-slate-900" data-carousel="static">
      {/* Carousel wrapper */}
      <div className="relative h-48 overflow-hidden rounded-lg md:h-64 dark:bg-slate-800">
        {adverts.map((advert, index) => (
          <div
            key={advert._id}
            className={`duration-700 ease-in-out absolute inset-0 transition-all transform ${getSlideClasses(index)}`}
            data-carousel-item={index === currentSlide ? 'active' : ''}
          >
            <img
              src={advert.imageUrl || '/api/placeholder/800/400'}
              className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
              alt={advert.title}
            />
            <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gray-800/70 dark:bg-slate-900/80">
              <h3 className="text-xl text-white font-semibold dark:text-slate-100">{advert.title}</h3>
              <p className="text-sm text-gray-200 dark:text-slate-300">{advert.description}</p>
              <p className="text-xs text-gray-300 dark:text-slate-400 mt-1">{advert.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Slider controls */}
      <button
        type="button"
        className="absolute left-1/2 top-0 z-30 -translate-x-1/2 px-4 cursor-pointer group focus:outline-none"
        onClick={previousSlide}
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-slate-700/30 group-hover:bg-white/50 dark:group-hover:bg-slate-700/50 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-slate-500 group-focus:outline-none">
          <svg
            className="w-4 h-4 text-white dark:text-slate-200 rotate-90"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 1 1 5l4 4"
            />
          </svg>
          <span className="sr-only">Previous</span>
        </span>
      </button>
      <button
        type="button"
        className="absolute left-1/2 bottom-0 z-30 -translate-x-1/2 px-4 cursor-pointer group focus:outline-none"
        onClick={nextSlide}
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-slate-700/30 group-hover:bg-white/50 dark:group-hover:bg-slate-700/50 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-slate-500 group-focus:outline-none">
          <svg
            className="w-4 h-4 text-white dark:text-slate-200 rotate-90"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 9 4-4-4-4"
            />
          </svg>
          <span className="sr-only">Next</span>
        </span>
      </button>

      {/* Indicators */}
      <div className="absolute z-30 flex flex-col space-y-3 top-1/2 right-4 -translate-y-1/2">
        {adverts.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? 'bg-white dark:bg-slate-200' : 'bg-white/50 dark:bg-slate-400/50'
            }`}
            aria-current={index === currentSlide}
            aria-label={`Slide ${index + 1}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default AdvertCarousel;