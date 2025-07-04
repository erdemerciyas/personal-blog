'use client';

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

interface HTMLContentProps {
  content: string;
  className?: string;
  truncate?: number; // Karakter sayısı limiti
  showMore?: boolean; // "Daha fazla" butonu göster
  onToggle?: () => void; // Toggle callback
}

// HTML formatını koruyarak kısaltma yapar
function truncateHTML(html: string, maxLength: number): string {
  if (typeof window === 'undefined') return html;
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Toplam metin uzunluğunu kontrol et
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  if (textContent.length <= maxLength) {
    return html;
  }
  
  // Akıllı kısaltma - HTML etiketlerini koruyarak
  let currentLength = 0;
  const processNode = (node: Node): Node | null => {
    if (currentLength >= maxLength) return null;
    
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      const remainingLength = maxLength - currentLength;
      
      if (text.length <= remainingLength) {
        currentLength += text.length;
        return node.cloneNode(true);
      } else {
        currentLength = maxLength;
        const truncatedText = text.substring(0, remainingLength).trim();
        return document.createTextNode(truncatedText + '...');
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const newElement = document.createElement(element.tagName);
      
      // Attributes'leri kopyala
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        newElement.setAttribute(attr.name, attr.value);
      }
      
      // Child node'ları işle
      for (let i = 0; i < element.childNodes.length; i++) {
        if (currentLength >= maxLength) break;
        
        const processedChild = processNode(element.childNodes[i]);
        if (processedChild) {
          newElement.appendChild(processedChild);
        }
      }
      
      return newElement;
    }
    
    return null;
  };
  
  const resultDiv = document.createElement('div');
  for (let i = 0; i < tempDiv.childNodes.length; i++) {
    if (currentLength >= maxLength) break;
    
    const processedNode = processNode(tempDiv.childNodes[i]);
    if (processedNode) {
      resultDiv.appendChild(processedNode);
    }
  }
  
  return resultDiv.innerHTML;
}

export default function HTMLContent({ 
  content, 
  className = '', 
  truncate,
  showMore = false,
  onToggle 
}: HTMLContentProps) {
  const [sanitizedContent, setSanitizedContent] = useState('');
  const [textLength, setTextLength] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && content && typeof window !== 'undefined') {
      try {
        // HTML içeriğini temizle ve güvenli hale getir
        const clean = DOMPurify.sanitize(content, {
          ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's', 'strike',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'blockquote', 'code', 'pre',
            'a', 'img',
            'div', 'span'
          ],
          ALLOWED_ATTR: [
            'href', 'target', 'rel',
            'src', 'alt', 'width', 'height',
            'class', 'style'
          ],
          ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
        });

        // HTML etiketlerini kaldırarak düz metin uzunluğunu al
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = clean;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        setTextLength(textContent.length);

        // Eğer truncate varsa, HTML formatını koruyarak kısalt
        if (truncate && textContent.length > truncate) {
          const truncatedHTML = truncateHTML(clean, truncate);
          setSanitizedContent(truncatedHTML);
        } else {
          setSanitizedContent(clean);
        }
      } catch (error) {
        console.error('HTMLContent sanitization error:', error);
        // Fallback: düz metin olarak göster
        const textContent = content.replace(/<[^>]*>/g, '');
        setTextLength(textContent.length);
        const displayText = truncate && textContent.length > truncate
          ? textContent.substring(0, truncate).trim() + '...'
          : textContent;
        setSanitizedContent(`<p>${displayText}</p>`);
      }
    } else if (!content) {
      setSanitizedContent('');
      setTextLength(0);
    }
  }, [content, truncate, mounted]);

  if (!mounted) {
    // Server-side rendering fallback - HTML etiketlerini temizle
    const plainText = content ? content.replace(/<[^>]*>/g, '') : '';
    const displayText = truncate && plainText.length > truncate 
      ? plainText.substring(0, truncate) + '...' 
      : plainText;
    
    return (
      <div className={className}>
        <div className="prose prose-sm max-w-none">
          <p>{displayText}</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className={`html-content ${className}`}>
      <div 
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        className="prose prose-sm max-w-none"
      />
      
      {/* Show More/Less Button */}
      {truncate && textLength > truncate && onToggle && (
        <button
          onClick={onToggle}
          className="text-teal-600 hover:text-teal-700 font-medium text-sm mt-2 inline-flex items-center transition-colors"
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

      <style jsx global>{`
        .html-content .prose {
          color: inherit;
        }
        
        .html-content .prose h1,
        .html-content .prose h2,
        .html-content .prose h3,
        .html-content .prose h4,
        .html-content .prose h5,
        .html-content .prose h6 {
          color: inherit;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          line-height: 1.2;
        }
        
        .html-content .prose h1 { font-size: 1.875rem; }
        .html-content .prose h2 { font-size: 1.5rem; }
        .html-content .prose h3 { font-size: 1.25rem; }
        .html-content .prose h4 { font-size: 1.125rem; }
        .html-content .prose h5 { font-size: 1rem; }
        .html-content .prose h6 { font-size: 0.875rem; }
        
        .html-content .prose p {
          margin-bottom: 1em;
          line-height: 1.6;
        }
        
        .html-content .prose strong {
          font-weight: 600;
          color: inherit;
        }
        
        .html-content .prose em {
          font-style: italic;
        }
        
        .html-content .prose u {
          text-decoration: underline;
        }
        
        .html-content .prose s,
        .html-content .prose strike {
          text-decoration: line-through;
        }
        
        .html-content .prose ul,
        .html-content .prose ol {
          margin: 1em 0;
          padding-left: 1.5em;
        }
        
        .html-content .prose ul {
          list-style-type: disc;
        }
        
        .html-content .prose ol {
          list-style-type: decimal;
        }
        
        .html-content .prose li {
          margin: 0.25em 0;
        }
        
        .html-content .prose blockquote {
          border-left: 4px solid #14b8a6;
          padding-left: 1em;
          margin: 1.5em 0;
          font-style: italic;
          background-color: #f0fdfa;
          padding: 1em;
          border-radius: 0.5rem;
        }
        
        .html-content .prose code {
          background-color: #f1f5f9;
          padding: 0.125em 0.25em;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: 'Courier New', monospace;
        }
        
        .html-content .prose pre {
          background-color: #1e293b;
          color: #f1f5f9;
          padding: 1em;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1em 0;
        }
        
        .html-content .prose pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }
        
        .html-content .prose a {
          color: #14b8a6;
          text-decoration: underline;
        }
        
        .html-content .prose a:hover {
          color: #0f766e;
        }
        
        .html-content .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1em 0;
        }
        
        /* Mobile responsive adjustments */
        @media (max-width: 640px) {
          .html-content .prose h1 { font-size: 1.5rem; }
          .html-content .prose h2 { font-size: 1.25rem; }
          .html-content .prose h3 { font-size: 1.125rem; }
          .html-content .prose h4 { font-size: 1rem; }
          
          .html-content .prose blockquote {
            margin-left: 0;
            margin-right: 0;
          }
        }
      `}</style>
    </div>
  );
} 