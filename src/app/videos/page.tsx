'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, TagIcon } from '@heroicons/react/24/outline';
import PageHero from '@/components/common/PageHero';
import Breadcrumbs from '@/components/Breadcrumbs';
import VideoCard from '@/components/videos/VideoCard';

interface Video {
  _id?: string;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  type: 'short' | 'normal';
  status: 'visible' | 'hidden';
  tags: string[];
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableChannels, setAvailableChannels] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hero, setHero] = useState<{ 
    title: string; 
    description: string; 
    buttonText: string; 
    buttonLink: string; 
  }>({ 
    title: 'Videolar', 
    description: 'YouTube kanalımızdaki en güncel ve popüler içeriklerimize göz atın',
    buttonText: 'Videoları Keşfet',
    buttonLink: '#video-content'
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastVideoElementRef = useRef<HTMLDivElement>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeFilter = searchParams?.get('type') || '';
  const channelFilter = searchParams?.get('channel') || '';

  // Load videos callback
  const loadVideos = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (channelFilter) params.append('channelId', channelFilter);
      params.append('status', 'visible'); // Only show visible videos
      params.append('limit', '50'); // Load more videos initially
      
      const response = await fetch(`/api/youtube?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos);
        setHasMore(data.hasMore);
        
        // Extract unique tags from videos
        const uniqueTags = [...new Set(data.videos.flatMap((video: any) => video.tags || []))];
        setAvailableTags(uniqueTags as string[]);
        
        // Load available channels
        const channelsRes = await fetch('/api/channels');
        if (channelsRes.ok) {
          const channelsData = await channelsRes.json();
          setAvailableChannels(channelsData);
        }
      } else {
        console.error('Failed to fetch videos');
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  }, [typeFilter, channelFilter]);

  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      
      try {
        // Fetch hero content
        const heroRes = await fetch('/api/admin/page-settings/videos');
        if (heroRes.ok) {
          const heroData = await heroRes.json();
          setHero({
            title: heroData.title || 'Videolar',
            description: heroData.description || 'YouTube kanalımızdaki en güncel ve popüler içeriklerimize göz atın',
            buttonText: heroData.buttonText || 'Videoları Keşfet',
            buttonLink: heroData.buttonLink || '#video-content'
          });
        } else {
          setHero({ 
            title: 'Videolar', 
            description: 'YouTube kanalımızdaki en güncel ve popüler içeriklerimize göz atın',
            buttonText: 'Videoları Keşfet',
            buttonLink: '#video-content'
          });
        }

        // Fetch initial videos
        await loadVideos();
      } catch (err) {
        console.error('Videos page fetch error:', err);
        // Still load videos even if hero content fails
        await loadVideos();
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [typeFilter, channelFilter, loadVideos]);

  // Filter videos based on search term and selected tags
  useEffect(() => {
    let result = videos;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply tag filter
    if (selectedTags.length > 0) {
      result = result.filter(video =>
        selectedTags.every(tag => video.tags.includes(tag))
      );
    }
    
    setFilteredVideos(result);
  }, [videos, searchTerm, selectedTags]);

  const loadMoreVideos = useCallback(async () => {
    if (!hasMore || !nextPageToken) return;
    
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (channelFilter) params.append('channelId', channelFilter);
      params.append('status', 'visible');
      params.append('limit', '12');
      params.append('pageToken', nextPageToken);
      
      const response = await fetch(`/api/youtube?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setVideos(prev => [...prev, ...data.videos]);
        setNextPageToken(data.nextPageToken || null);
        setHasMore(!!data.nextPageToken);
      }
    } catch (error) {
      console.error('Error loading more videos:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [typeFilter, channelFilter, hasMore, nextPageToken]);

  // Infinite scroll implementation
  useEffect(() => {
    if (loading || loadingMore) return;
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreVideos();
      }
    });

    if (lastVideoElementRef.current) {
      observer.current.observe(lastVideoElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, loadingMore, hasMore, loadMoreVideos]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <PageHero
          title={hero.title}
          description={hero.description}
          buttonText={hero.buttonText}
          buttonLink={hero.buttonLink}
        />
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <PageHero
        title={hero.title}
        description={hero.description}
        buttonText={hero.buttonText}
        buttonLink={hero.buttonLink}
      />
      
      {/* Breadcrumbs */}
      <div className="py-4">
        <div className="container mx-auto px-4">
          <Breadcrumbs />
        </div>
      </div>
      
      {/* Video Content */}
      <div id="video-content" className="container mx-auto px-4 py-12">
        {/* Search and Filter */}
        <div className="mb-10 max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="relative flex-1">
              <div className="relative">
                <button 
                  onClick={toggleSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1"
                >
                  <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                </button>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Video ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-3 pl-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary-600 transition-all ${isSearchOpen ? 'md:w-full' : ''}`}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Type Filter */}
              <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-1">
                <button
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('type');
                    router.push(url.pathname + url.search);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    !typeFilter
                      ? 'bg-brand-primary-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('type', 'normal');
                    router.push(url.pathname + url.search);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    typeFilter === 'normal'
                      ? 'bg-brand-primary-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('type', 'short');
                    router.push(url.pathname + url.search);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    typeFilter === 'short'
                      ? 'bg-brand-primary-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Kısa
                </button>
              </div>

              {/* Channel Filter */}
              {availableChannels.length > 0 && (
                <select
                  value={channelFilter}
                  onChange={(e) => {
                    const url = new URL(window.location.href);
                    if (e.target.value) {
                      url.searchParams.set('channel', e.target.value);
                    } else {
                      url.searchParams.delete('channel');
                    }
                    router.push(url.pathname + url.search);
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                >
                  <option value="">Tüm Kanallar</option>
                  {availableChannels.map((channel) => (
                    <option key={channel.channelId} value={channel.channelId}>
                      {channel.channelName} ({channel.videoCount} video)
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                <TagIcon className="w-4 h-4 mr-1" />
                Etiketler:
              </span>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-brand-primary-600 text-white'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {(searchTerm || selectedTags.length > 0) && (
                <button
                  onClick={clearSearch}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors ml-2"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search Results Stats */}
        {(searchTerm || selectedTags.length > 0) && (
          <div className="mb-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {searchTerm ? `"${searchTerm}" için ` : ''}
              {selectedTags.length > 0 ? `${selectedTags.join(', ')} etiketli ` : ''}
              <span className="font-medium">{filteredVideos.length}</span> video bulundu
            </p>
          </div>
        )}

        {/* Videos Grid */}
        {filteredVideos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video, index) => (
                <div 
                  ref={index === filteredVideos.length - 1 ? lastVideoElementRef : null}
                  key={video.videoId}
                >
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
            {loadingMore && (
              <div className="flex justify-center mt-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary-600"></div>
              </div>
            )}
            {!hasMore && !loadingMore && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Tüm videolar yüklendi
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <svg 
              className="mx-auto h-16 w-16 text-slate-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">Video bulunamadı</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {searchTerm || selectedTags.length > 0 ? 
                'Aramanızla eşleşen bir video bulunamadı. Farklı anahtar kelimeler kullanmayı veya filtreleri temizlemeyi deneyin.' : 
                'Henüz hiç video eklenmemiş. Daha sonra tekrar kontrol edin.'}
            </p>
            {(searchTerm || selectedTags.length > 0) && (
              <button
                onClick={clearSearch}
                className="mt-4 px-4 py-2 bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 transition-colors"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}