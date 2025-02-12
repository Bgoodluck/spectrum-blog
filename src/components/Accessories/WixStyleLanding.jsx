import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from 'flowbite-react';
import { ArrowRight, Star, Globe, Box, Zap } from 'lucide-react';
import { assets } from '../../assets/assets';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const WixStyleLanding = () => {
  const headerRef = useRef(null);
  const featureRefs = useRef([]);
  const imageRef = useRef(null);

  useEffect(() => {
    // Hero section animation
    gsap.from(headerRef.current.children, {
      duration: 1,
      y: 100,
      opacity: 0,
      stagger: 0.2,
      ease: "power3.out"
    });

    // Features animations
    featureRefs.current.forEach((feature, index) => {
      gsap.from(feature, {
        scrollTrigger: {
          trigger: feature,
          start: "top center+=100",
          toggleActions: "play none none reverse"
        },
        duration: 0.8,
        y: 50,
        opacity: 0,
        delay: index * 0.2,
        ease: "power2.out"
      });
    });

    // Image parallax effect
    gsap.to(imageRef.current, {
      scrollTrigger: {
        trigger: imageRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      },
      y: -100,
      ease: "none"
    });
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div ref={headerRef} className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Let's Play a Game
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
          Dive into a world of endless fun and thrilling challenges!
          </p>
          <Button size="lg" gradientDuoTone="purpleToPink" className="transform hover:scale-105 transition-transform">
            <span className="flex items-center gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </span>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-gray-50 dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="w-8 h-8 text-purple-500" />,
                title: "Word and Trivia Games",
                description: "Step into the arena, sharpen your skills, and compete with the best!"
              },
              {
                icon: <Box className="w-8 h-8 text-blue-500" />,
                title: "Strategy Games",
                description: "Unleash your creativity, strategy, and speed are you ready?"
              },
              {
                icon: <Star className="w-8 h-8 text-pink-500" />,
                title: "Simulation Games",
                description: "Escape reality for a moment and conquer virtual adventures."
              },
              {
                icon: <Zap className="w-8 h-8 text-yellow-500" />,
                title: "Multiplayer Action Games",
                description: "Get ready to test your wits, reflexes, and teamwork!"
              }
            ].map((feature, index) => (
              <div
                key={index}
                ref={el => featureRefs.current[index] = el}
                className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="space-y-4">
                  {feature.icon}
                  <h3 className="text-xl font-bold dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative overflow-hidden py-20">
        <div ref={imageRef} className="container mx-auto px-4">
          <img
            src={assets.advert5}
            alt="Website Builder Interface"
            className="rounded-2xl shadow-2xl"
          />
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold text-white">
              Let the games begin
            </h2>
            <p className="text-xl text-white/90">
            Let's spark some fun, challenge your mind, and create unforgettable moments together!
            </p>
            <Button
              size="lg"
              color="white"
              className="transform hover:scale-105 transition-transform"
            >
              Enjoy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WixStyleLanding;