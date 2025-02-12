import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import summaryApi from '../../common';



function SkitCarousel() {
  const [skits, setSkits] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    fetchRecentSkits();
  }, []);

  const fetchRecentSkits = async () => {
    try {
      const response = await fetch(summaryApi.skitGetRecent.url);
      const data = await response.json();
      setSkits(data);
    } catch (error) {
      console.error('Error fetching recent skits:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === skits.length - 1 ? 0 : prevIndex + 1
    );
  }, [skits.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? skits.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    let interval;
    if (isPlaying && skits.length > 0) {
      interval = setInterval(nextSlide, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide, skits.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-8 dark:bg-slate-900">
      <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">Recent Skits</h2>
      
      <div className="relative group">
        <div className="overflow-hidden rounded-xl">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {skits.map((skit) => (
              <div 
                key={skit._id}
                className="min-w-full"
              >
                <div className="aspect-video relative">
                  <video
                    src={skit.videoUrl}
                    className="w-full h-full object-cover rounded-xl"
                    controls={false}
                    loop
                    muted
                    onMouseEnter={(e) => {
                      e.target.play();
                      setIsPlaying(false);
                    }}
                    onMouseLeave={(e) => {
                      e.target.pause();
                      setIsPlaying(true);
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                    <h3 className="text-white text-xl font-bold">{skit.title}</h3>
                    <p className="text-white text-sm mt-2">{skit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={prevSlide}
        >
          <ChevronLeft className="w-6 h-6 dark:text-white" />
        </button>
        
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={nextSlide}
        >
          <ChevronRight className="w-6 h-6 dark:text-white" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {skits.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
              }`}
              onClick={() => {
                setCurrentIndex(index);
                setIsPlaying(false);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SkitCarousel;