import React, { useEffect, useState } from "react";
import { Button } from "flowbite-react";
import { Book } from "lucide-react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import HeroAction from "../../components/Accessories/HeroAction";
import summaryApi from "../../common";
import PostCard from "../../components/Accessories/PostCard";
import Adverts from "../Adverts/Adverts";
import AdvertSubscribe from "../Adverts/AdvertSubscribe";
import SkitCarousel from "../Skits/SkitCarousel";
import WixStyleLanding from "../../components/Accessories/WixStyleLanding";
import EntertainmentPosts from "../Operations/EntertainmentPosts";

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${summaryApi.getAllPosts.url}?limit=9`, {
          method: summaryApi.getAllPosts.method,
        });
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const responseData = await response.json();
        setPosts(responseData.posts);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-8 md:px-12 py-12">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          {/* Left side - Text content */}
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white leading-tight">
              Welcome to Spectrum Blog{" "}
              <span className="text-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white px-2 py-1">
                by Sonia
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                where ideas come to life!
              </span>
            </h1>
            <Link to="/search">
              <Button gradientDuoTone="purpleToPink" size="lg" className="mt-6">
                <Book className="mr-2 h-5 w-5" />
                Start exploring
              </Button>
            </Link>
          </div>

          {/* Right side - Video */}
          <div className="flex-1 flex flex-col items-center">
            <video
              src={assets.logo4}
              className="w-64 h-64 object-cover rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 [filter:contrast(1.2)_brightness(1.1)_saturate(1.2)]"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/api/placeholder/video" type="video/mp4" />
            </video>
            <h3 className="text-[14px] font-medium text-gray-600 dark:text-gray-300 mt-4">
              Spectrum Blog{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white text-[8px] px-2 py-1">
                By Sonia
              </span>
            </h3>
          </div>
        </div>

        {/* Description Section */}
        <div className="max-w-3xl mx-auto">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center">
            At Spectrum Blog{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white text-[8px] px-2 py-1">
              By Sonia
            </span>{" "}
            your ultimate destination for inspiration, knowledge, and
            creativity. Here, we explore a vibrant spectrum of ideas, from
            lifestyle and wellness to technology, art, and personal growth.
            Whether you're seeking fresh perspectives, expert insights, or
            simply a moment of inspiration, you'll find it all right here. Join
            me on this journey of discovery and connection as we celebrate the
            beauty of diverse thoughts and experiences. Dive in, explore, and
            let's make every read a meaningful adventure!
          </p>
        </div>
      </div>
      <div className="p-3">
        <HeroAction />
      </div>
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7">
        {posts && posts.length > 0 && (
          <div className="flex flex-col gap-8">
            <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">
              Recent Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            <Link to={'/search'}> 
                <Button gradientDuoTone="purpleToPink" size="lg" className="w-full" outline>
                  See All Posts
                </Button>  
            </Link>
          </div>
        )}
      </div>
      <div className="p-3">
          <Adverts/>
      </div>
      <div className="p-3">
         <AdvertSubscribe/>
      </div>
      <div className="p-3">
    <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/2">
            <SkitCarousel/>
            <Link to={'/skit-gallery'}>
                <Button gradientDuoTone="purpleToBlue" className="mt-4 w-full">
                    View Skit Gallery
                </Button>
            </Link>
        </div>
        <div className="md:w-1/2">
            <EntertainmentPosts/>
            <Link to={'/search?category=entertainment'}>
                <Button gradientDuoTone="purpleToPink" className="mt-4 w-full">
                    Explore Entertainment Posts
                </Button>
            </Link>
        </div>
    </div>
</div>
       <div className="p-3">
         <WixStyleLanding/>
       </div>
       <div>
       <SkitCarousel/>
       </div>
    </div>
  );
};

export default Home;
