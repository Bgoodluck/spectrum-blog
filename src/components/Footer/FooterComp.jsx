import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { Footer } from "flowbite-react";
// import Logo from '../Logo/Logo';

const FooterComp = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();



  const socialLinks = [
    {
      Icon: FaFacebookF,
      link: "https://www.facebook.com",
      label: "Facebook",
    },
    { 
      Icon: FaTwitter, 
      link: "https://www.twitter.com", 
      label: "Twitter" 
    },
    {
      Icon: FaInstagram,
      link: "https://www.instagram.com",
      label: "Instagram",
    },
    {
      Icon: FaLinkedinIn,
      link: "https://www.linkedin.com",
      label: "LinkedIn",
    },
    { 
      Icon: FaYoutube, 
      link: "https://www.youtube.com", 
      label: "YouTube" 
    },
  ];

  return (
    <Footer className="relative w-full bg-white-300 dark:bg-slate-900 shadow-lg">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 to-pink-600" />

      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Brand and Logo Section */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start space-y-1">
            <div className="h-16 w-16">
              <video
                src={assets.logo4}
                autoPlay
                muted
                loop
                playsInline
                onClick={() => navigate("/")}
                className="w-12 rounded-lg object-cover cursor-pointer [filter:contrast(1.2)_brightness(1.1)_saturate(1.2)]"
              />
            </div>
            <div className="text-sm font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              <span>Spectrum Blog</span>
              <span className="text-xs block md:inline md:ml-1">by Sonia</span>
            </div>
          </div>

          {/* Quick Links - Compact Grid */}
          <div className="md:col-span-6 grid grid-cols-2 md:grid-cols-4 gap-2 text-center md:text-left text-sm">
            {[
              {
                title: "Company",
                links: ["About", "Careers", "Contact"],
              },
              {
                title: "Support",
                links: ["Help", "FAQs", "Terms"],
              },
              {
                title: "Services",
                links: ["Adverts", "Pricing", "Docs"],
              },
              {
                title: "Resources",
                links: ["Blog", "Events", "Guides"],
              },
            ].map((section, index) => (
              <div key={index} className="space-y-1">
                <h3 className="font-semibold text-slate-800 dark:text-slate-300 text-xs">
                  {section.title}
                </h3>
                <ul className="space-y-0.5">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href="#"
                        className="text-xs text-slate-600 dark:text-slate-400 hover:text-violet-600 transition-colors duration-300"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social and Copyright Section */}
          <div className="md:col-span-3 flex flex-col items-center md:items-end space-y-2">
            {/* Social Media Icons */}
            <div className="flex gap-2">
              {socialLinks.map(({ Icon, link, label }, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group p-1.5 rounded-full transition-all duration-300 hover:scale-110"
                >
                  <Icon className="text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300 group-hover:text-violet-600" />
                </a>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                © {currentYear} Spectrum Blog <span>by Sonia</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 to-pink-600" />
    </Footer>
  );
};

export default FooterComp;
