import React, { useState, useEffect } from 'react';
import { Search, Play } from 'lucide-react';
import summaryApi from '../../common';


function SkitGallery() {
  const [skits, setSkits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSkit, setSelectedSkit] = useState(null);

  useEffect(() => {
    fetchSkits();
  }, []);

  const fetchSkits = async () => {
    try {
      const response = await fetch(summaryApi.skitAllGet.url);
      const data = await response.json();
      setSkits(data);
      console.log("gallery", data)
    } catch (error) {
      console.error('Error fetching skits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSkits = skits.filter(skit => 
    skit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skit.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <h2 className='text-2xl mb-1'>Skit Gallery</h2>
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search skits by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkits.map((skit) => (
              <div 
                key={skit._id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative">
                  <video
                    src={skit.videoUrl}
                    className="w-full h-64 object-cover"
                    poster={skit.thumbnailUrl}
                    onClick={() => setSelectedSkit(skit)}
                  />
                  <button 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-300"
                    onClick={() => setSelectedSkit(skit)}
                  >
                    <Play className="w-16 h-16 text-white" />
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{skit.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{skit.description}</p>
                  <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <img
                      src={skit.uploadedBy.profilePicture || 'default-avatar.png'}
                      alt={skit.uploadedBy.userName}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span>{skit.uploadedBy.userName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedSkit && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSkit(null)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4">
              <video
                src={selectedSkit.videoUrl}
                className="w-full rounded-lg"
                controls
                autoPlay
              />
              <h3 className="text-2xl font-bold mt-4 dark:text-white">{selectedSkit.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">{selectedSkit.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default SkitGallery;