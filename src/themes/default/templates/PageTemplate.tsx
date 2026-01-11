/**
 * Default Page Template
 */

import React from 'react';

interface PageTemplateProps {
  title?: string;
  content?: string;
  children?: React.ReactNode;
}

export default function PageTemplate({
  title,
  content,
  children,
}: PageTemplateProps) {
  return (
    <article className="max-w-4xl mx-auto py-12 px-4">
      {title && (
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        </header>
      )}
      
      <div className="prose prose-lg max-w-none">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          children
        )}
      </div>
    </article>
  );
}
