import React, { useEffect, useState } from 'react';
import { TextInput, Select, Button, Spinner, Card } from 'flowbite-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, Clock, TrendingUp, Bookmark, Calendar, X, Grid, List } from 'lucide-react';
import summaryApi from '../../common';

const categories = [
  { value: 'technology', label: 'Technology' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'politics', label: 'Politics' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'business', label: 'Business & Finance' },
  { value: 'sports', label: 'Sports' },
  { value: 'food', label: 'Food & Cooking' },
  { value: 'travel', label: 'Travel' },
  { value: 'education', label: 'Education' }
];

const Search = () => {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: 'desc',
    category: '',
    timeframe: 'all',
    view: 'grid'
  });
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  const timeframes = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' }
  ];

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const sortFromUrl = urlParams.get('sort');
    const categoryFromUrl = urlParams.get('category');
    const timeframeFromUrl = urlParams.get('timeframe');
    const viewFromUrl = urlParams.get('view');
    
    if (searchTermFromUrl || sortFromUrl || categoryFromUrl || timeframeFromUrl || viewFromUrl) {
      setSidebarData({
        searchTerm: searchTermFromUrl || '',
        sort: sortFromUrl || 'desc',
        category: categoryFromUrl || '',
        timeframe: timeframeFromUrl || 'all',
        view: viewFromUrl || 'grid'
      });
    }

    fetchPosts(urlParams.toString());
  }, [location.search]);

  // New function to fetch search suggestions
  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`${summaryApi.getAllPosts.url}?searchTerm=${query}&limit=5`, {
        method: summaryApi.getAllPosts.method
      });
      
      if (!response.ok) return;

      const data = await response.json();
      if (data.success) {
        setSuggestions(data.posts);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  // Debounced search
  const debouncedSearch = debounce(fetchSuggestions, 300);

  const fetchPosts = async (searchQuery) => {
    try {
      setLoading(true);
      const response = await fetch(`${summaryApi.getAllPosts.url}?${searchQuery}`, {
        method: summaryApi.getAllPosts.method
      });
      
      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
        setShowMore(data.posts.length === 9);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSidebarData(prev => ({ ...prev, [id]: value }));
    
    if (id === 'searchTerm') {
      debouncedSearch(value);
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSidebarData(prev => ({ ...prev, searchTerm: suggestion.title }));
    setShowSuggestions(false);
    navigate(`/search?searchTerm=${encodeURIComponent(suggestion.title)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    Object.entries(sidebarData).forEach(([key, value]) => {
      if (value) urlParams.append(key, value);
    });
    navigate(`/search?${urlParams.toString()}`);
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setSidebarData({
      searchTerm: '',
      sort: 'desc',
      category: '',
      timeframe: 'all',
      view: 'grid'
    });
    navigate('/search');
  };

  const toggleView = () => {
    setSidebarData(prev => ({
      ...prev,
      view: prev.view === 'grid' ? 'list' : 'grid'
    }));
  };


  const PostCard = ({ post }) => (
    <Link to={`/post/${post.slug}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-300">
        {post.mediaUrl && (
          <div className="w-full h-48 overflow-hidden rounded-t-lg">
            {post.mediaType === 'video' ? (
              <div className="relative w-full h-full">
                <video 
                  className="w-full h-full object-cover"
                  preload="metadata"
                >
                  <source src={post.mediaUrl} type="video/mp4" />
                </video>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l7-5-7-5z" />
                  </svg>
                </div>
              </div>
            ) : (
              <img 
                src={post.mediaUrl} 
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            )}
          </div>
        )}
        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors duration-300">
              {post.title}
            </h3>
            <Button 
              size="xs" 
              color="purple"
              onClick={(e) => {
                e.preventDefault();
                navigate(`/search?category=${post.category}`);
              }}
            >
              {post.category}
            </Button>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
            {post.content.replace(/<[^>]*>/g, '')}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Calendar size={16} className="mr-1" />
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="flex items-center">
                <Clock size={16} className="mr-1" />
                {(post.content.length / 1000).toFixed(0)} mins read
              </span>
            </div>
            {post.views && (
              <span className="flex items-center">
                <TrendingUp size={16} className="mr-1" />
                {post.views} views
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );



  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`
        fixed md:relative top-0 left-0 z-40 w-64 h-screen 
        transition-transform duration-300 ease-in-out
        ${isFilterOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
      `}>
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filters</h2>
            <Button 
              size="sm"
              color="gray"
              className="md:hidden"
              onClick={() => setIsFilterOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Search
              </label>
              <TextInput 
                id="searchTerm"
                type="text"
                icon={SearchIcon}
                value={sidebarData.searchTerm}
                onChange={handleChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search posts..."
                className="w-full"
              />
              
              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion._id}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="font-medium">{suggestion.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {suggestion.category}
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Category
              </label>
              <Select 
                id="category"
                value={sidebarData.category}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Time Period
              </label>
              <Select 
                id="timeframe"
                value={sidebarData.timeframe}
                onChange={handleChange}
                className="w-full"
              >
                {timeframes.map(({ label, value }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Sort By
              </label>
              <Select 
                id="sort"
                value={sidebarData.sort}
                onChange={handleChange}
                className="w-full"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
                <option value="popular">Most Popular</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Button type="submit" className="w-full" gradientDuoTone='purpleToPink'>
                Apply Filters
              </Button>
              <Button 
                gradientDuoTone='purpleToBlue'
                onClick={clearFilters} 
                className="w-full"
                outline
              >
                Clear Filters
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="mb-4 flex justify-between items-center">
          <Button 
            className="md:hidden"
            onClick={() => setIsFilterOpen(true)}
          >
            <SlidersHorizontal size={20} className="mr-2" />
            Filters
          </Button>

          <div className="flex items-center gap-2">
            <Button
              gradientDuoTone='purpleToBlue'
              size="sm"
              onClick={toggleView}
            >
              {sidebarData.view === 'grid' ? (
                <List size={20} />
              ) : (
                <Grid size={20} />
              )}
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {posts.length} results
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="xl" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              No posts found. Try adjusting your filters.
            </div>
          </div>
        ) : (
          <div className={`
            ${sidebarData.view === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
            }
          `}>
            {posts.map(post => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}

        {showMore && (
          <div className="mt-6 text-center">
            <Button gradientDuoTone='purpleToBlue'>
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;