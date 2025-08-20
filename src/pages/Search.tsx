import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { useVideo } from '../contexts/VideoContext';
import { Video, SearchFilters } from '../types';
import VideoCard from '../components/VideoCard';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
    uploadDate: 'any',
    duration: 'any',
    category: 'any'
  });

  const { searchVideos } = useVideo();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, filters]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchResults = await searchVideos(query, filters);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const categories = [
    'any',
    'Gaming',
    'Music',
    'Sports',
    'News',
    'Entertainment',
    'Education',
    'Technology',
    'Travel',
    'Cooking'
  ];

  return (
    <div className="pt-16 px-6">
      {/* Search Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Search results for "{query}"
          </h1>
          <p className="text-youtube-lightgray mt-1">
            {results.length} results
          </p>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 bg-youtube-gray hover:bg-gray-600 px-4 py-2 rounded-full transition-colors"
        >
          <SlidersHorizontal size={16} />
          <span>Filters</span>
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-youtube-gray rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4">Search filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Sort by</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
                className="input-field w-full"
              >
                <option value="relevance">Relevance</option>
                <option value="upload_date">Upload date</option>
                <option value="view_count">View count</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Upload date</label>
              <select
                value={filters.uploadDate}
                onChange={(e) => handleFilterChange('uploadDate', e.target.value as any)}
                className="input-field w-full"
              >
                <option value="any">Any time</option>
                <option value="hour">Last hour</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="year">This year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <select
                value={filters.duration}
                onChange={(e) => handleFilterChange('duration', e.target.value as any)}
                className="input-field w-full"
              >
                <option value="any">Any duration</option>
                <option value="short">Under 4 minutes</option>
                <option value="medium">4-20 minutes</option>
                <option value="long">Over 20 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-field w-full"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'any' ? 'Any category' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-youtube-red"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {results.length > 0 ? (
            results.map((video) => (
              <div key={video.id} className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-80 aspect-video rounded-lg overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  
                  <div className="text-sm text-youtube-lightgray mb-2">
                    {video.views.toLocaleString()} views • {new Date(video.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      {video.uploaderAvatar ? (
                        <img
                          src={video.uploaderAvatar}
                          alt={video.uploaderName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-youtube-red flex items-center justify-center text-white text-xs font-bold">
                          {video.uploaderName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-youtube-lightgray">
                      {video.uploaderName}
                    </span>
                  </div>
                  
                  <p className="text-sm text-youtube-lightgray line-clamp-2">
                    {video.description}
                  </p>
                  
                  {video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {video.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-youtube-gray px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-youtube-lightgray text-lg">
                No results found for "{query}"
              </p>
              <p className="text-youtube-lightgray mt-2">
                Try different keywords or remove search filters
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;