'use client';

import React from 'react';
import { withSkeleton } from '../withSkeleton';

// Example page component
function ExamplePageComponent() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Örnek Sayfa
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Kart {index + 1}</h3>
              <p className="text-gray-600">
                Bu bir örnek içeriktir. Yeni loading sistemi ile sayfa geçişlerinde
                otomatik olarak skeleton loading gösterilir.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Export the component wrapped with skeleton loading
export default withSkeleton(ExamplePageComponent);