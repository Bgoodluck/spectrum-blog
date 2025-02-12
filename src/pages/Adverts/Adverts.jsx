import React from 'react';
import AdvertCarousel from './AdvertCarousel';
import { Megaphone } from 'lucide-react';

function Adverts() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left side - Advertisement Message */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Advertise with Us</h1>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 dark:border-slate-500 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-100 leading-relaxed space-y-4">
              <p className="mb-4">
                📢 Advertise with Spectrum Blog by Sonia! 🌟
              </p>
              
              <p className="mb-4">
                Looking to elevate your brand and connect with an engaged, diverse audience? 
                Spectrum Blog by Sonia is the perfect platform for your advertisements! 
                Our readers are curious, inspired, and always on the lookout for new ideas, 
                products, and services.
              </p>
              
              <p className="mb-4">
                Whether you're a business, brand, or creative entrepreneur, we offer prime 
                ad spaces to help you shine. Let's work together to spotlight your story 
                and connect with thousands of potential customers.
              </p>
              
              <p className="text-blue-600">
                📩 Contact us today and let's make your brand the star of the Spectrum! ✨
              </p>
            </h2>
          </div>
        </div>

        {/* Right side - Carousel */}
        <div className="w-full">
          <div className="bg-white dark:bg-slate-700 p-4 rounded-lg dark:border-slate-500 shadow-md border border-gray-100">
            <div className="max-w-xl mx-auto">
              <AdvertCarousel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Adverts;