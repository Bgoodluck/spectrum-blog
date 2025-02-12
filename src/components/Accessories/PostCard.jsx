import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge } from 'flowbite-react';
import { Calendar, Clock, ArrowRight, Play } from 'lucide-react';
import summaryApi from '../../common';

const PostCard = ({ post }) => {
  const [author, setAuthor] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const defaultUserImage = "https://cdn.pixabay.com/animation/2022/12/05/10/47/10-47-58-930_512.gif";
const defaultUserName = "Anonymous User";

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const url = summaryApi.singleUser.url.replace(':userId', post.userId);
        const response = await fetch(url, {
          method: summaryApi.singleUser.method,
        });
        if (!response.ok) {
          setAuthor(null);
          return;
        }
        const data = await response.json();
        if (data.success && data.user) {
          setAuthor(data.user);
        }else {
          setAuthor(null);
        }
      } catch (error) {
        console.error('Error fetching author:', error);
      }
    };

    if (post.userId && post.userId !== 'undefined') {
      fetchAuthor();
    } else {
      setAuthor(null);
    }
  }, [post.userId]);

  const MediaPreview = () => {
    if (post.mediaType === 'video') {
      return (
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg group">
          <video
            className="w-full h-full object-cover"
            preload="metadata"
          >
            <source src={post.mediaUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
        <img
          src={post.mediaUrl || "/api/placeholder/400/300"}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  return (
    <Link 
      to={`/post/${post.slug}`}
      className="block transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
    >
      <Card 
        className={`h-full overflow-hidden transition-all duration-300 
          hover:shadow-xl dark:hover:shadow-gray-700 
          ${isHovered ? 'border-blue-500 dark:border-blue-400' : 'border-transparent'}
          bg-white dark:bg-gray-800`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <MediaPreview />
        
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge color="purple" className="text-xs">
              {post.category}
            </Badge>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Calendar className="w-3 h-3" />
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Clock className="w-3 h-3" />
              {(post.content.length / 1000).toFixed(0)} min read
            </div>
          </div>

          <h5 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-2 line-clamp-2">
            {post.title}
          </h5>

          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
            {post.content.replace(/<[^>]*>/g, '').slice(0, 100)}...
          </p>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <img
                src={author?.profilePicture || defaultUserImage}
                alt={author?.userName || defaultUserName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium dark:text-gray-300">
              {author?.userName ? `@${author.userName}` : defaultUserName}
              </span>
            </div>

            <div 
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Read Article
              <ArrowRight className={`w-4 h-4 transform transition-transform duration-300 ${
                isHovered ? 'translate-x-2' : ''
              }`} />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default PostCard;