'use client';

import { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface SafeHtmlRendererProps {
  html: string;
  className?: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
  maxLength?: number;
  showReadMore?: boolean;
}

const SafeHtmlRenderer: React.FC<SafeHtmlRendererProps> = ({
  html,
  className = 'w-full max-w-none',
  allowedTags,
  allowedAttributes,
  maxLength,
  showReadMore = false
}) => {
  const sanitizedHtml = useMemo(() => {
    if (!html) return '';
    if (typeof window === 'undefined') return html; // SSR'da temizleme yapma

    // Varsayılan güvenli etiketler
    const defaultAllowedTags = [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre', 'blockquote',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'span', 'div', 'mark'
    ];

    // Varsayılan güvenli özellikler
    const defaultAllowedAttributes = [
      'href', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'style', 'class',
      'colspan', 'rowspan',
      'data-*'
    ];

    const config = {
      ALLOWED_TAGS: allowedTags || defaultAllowedTags,
      ALLOWED_ATTR: allowedAttributes || defaultAllowedAttributes,
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_TRUSTED_TYPE: false
    };

    let cleanHtml = DOMPurify.sanitize(html, config);

    // Uzunluk sınırlaması
    if (maxLength && cleanHtml.length > maxLength) {
      cleanHtml = cleanHtml.substring(0, maxLength) + '...';
    }

    return cleanHtml;
  }, [html, allowedTags, allowedAttributes, maxLength]);

  if (!sanitizedHtml) {
    return null;
  }

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default SafeHtmlRenderer;