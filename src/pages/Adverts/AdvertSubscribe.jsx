import React from "react";
import { Card, Button } from "flowbite-react";
import { assets } from "../../assets/assets";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function AdvertSubscribe() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Image Grid with hover effects */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="transform transition-transform hover:scale-105">
          <img 
            className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-xl dark:shadow-gray-800" 
            src={assets.advert} 
            alt="Creative content" 
          />
        </div>
        <div className="transform transition-transform hover:scale-105">
          <img 
            className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-xl dark:shadow-gray-800" 
            src={assets.advert5} 
            alt="Blog content" 
          />
        </div>
        <div className="transform transition-transform hover:scale-105">
          <img 
            className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-xl dark:shadow-gray-800" 
            src={assets.advert3} 
            alt="Storytelling" 
          />
        </div>
        <div className="transform transition-transform hover:scale-105">
          <img 
            className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-xl dark:shadow-gray-800" 
            src={assets.advert4} 
            alt="Creative writing" 
          />
        </div>
      </div>

      {/* Content Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700">
        <div className="text-center space-y-6">
          {/* Title with icon */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-purple-500 dark:text-purple-400" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Join Our Creative Community</h2>
            <Sparkles className="w-6 h-6 text-purple-500 dark:text-purple-400" />
          </div>

          {/* Main content with better typography */}
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Are you a passionate blogger, a storyteller, or a creative content creator? <br /> 
            Sprectrum Blog <span className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white text-[8px] px-2 py-1'>By Sonia</span> 
            has the perfect platform for you!
          </p>
          
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Upgrade your account today and unlock the opportunity to showcase your unique works, 
            share your stories, and have your content published right here on our website. 
            Let your voice be heard and your creativity shine! <br />Get Started Today.
          </p>

          {/* CTA Button */}
          <Link to="/vip-upgrade">
          <Button 
            gradientDuoTone="purpleToPink"
            size="lg"
            className="mt-6 transform transition-transform hover:scale-105 dark:shadow-lg dark:shadow-purple-900/30"
          >
            <span className="flex items-center gap-2">
            Upgrade to VIP
              <ArrowRight className="w-5 h-5" />
            </span>
          </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default AdvertSubscribe;