import { PlayIcon } from '@heroicons/react/24/solid';

interface VideoCardProps {
  video: {
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    publishedAt: string;
    type: 'short' | 'normal';
    tags: string[];
  };
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="relative">
        {/* Thumbnail */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <a
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 text-white p-3 rounded-full transform scale-90 group-hover:scale-100 transition-transform duration-300"
            aria-label={`YouTube'da izle: ${video.title}`}
          >
            <PlayIcon className="w-6 h-6" />
          </a>
        </div>
        
        {/* Video Type Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full shadow-md ${
            video.type === 'short' 
              ? 'bg-purple-600 text-white' 
              : 'bg-blue-600 text-white'
          }`}>
            {video.type === 'short' ? 'Kısa' : 'Normal'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        {/* Title */}
        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-brand-primary-600 dark:group-hover:text-brand-primary-400 transition-colors">
          {video.title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
          {video.description}
        </p>
        
        {/* Tags */}
        {video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {video.tags.slice(0, 3).map((tag, i) => (
              <span 
                key={i} 
                className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {video.tags.length > 3 && (
              <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded text-xs">
                +{video.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Footer */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(video.publishedAt).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
          <a
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-brand-primary-600 hover:text-brand-primary-800 dark:text-brand-primary-400 dark:hover:text-brand-primary-300 text-sm font-medium transition-colors"
          >
            İzle
            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}