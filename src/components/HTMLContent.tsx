'use client';

import SafeHtmlRenderer from './common/SafeHtmlRenderer';

interface HTMLContentProps {
  content: string;
  className?: string;
  truncate?: number;
  showMore?: boolean;
  onToggle?: () => void;
}

export default function HTMLContent({ 
  content, 
  className = '', 
  truncate,
  showMore = false,
  onToggle 
}: HTMLContentProps) {
  if (!content) {
    return null;
  }

  return (
    <div className={`html-content ${className}`}>
      <SafeHtmlRenderer 
        html={content}
        className="prose prose-sm max-w-none"
        maxLength={truncate}
        showReadMore={showMore}
      />
      
      {/* Show More/Less Button */}
      {truncate && onToggle && (
        <button
          onClick={onToggle}
          className="text-brand-primary-700 hover:text-brand-primary-800 font-medium text-sm mt-2 inline-flex items-center transition-colors"
        >
          {showMore ? 'Daha Az' : 'Daha Fazla'}
          <svg 
            className={`w-4 h-4 ml-1 transition-transform ${showMore ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
} 