/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline - Personal Blog',
  description: 'You are currently offline. Please check your internet connection.',
  robots: {
    index: false,
    follow: false
  }
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
        {/* Offline Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-red-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" 
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-4">
          You Are Offline
        </h1>

        {/* Description */}
        <p className="text-gray-300 mb-6 leading-relaxed">
          It looks like you are not connected to the internet. Some features may not be available until you reconnect.
        </p>

        {/* Status Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">No internet connection</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Go Back
          </button>
        </div>

        {/* Cached Content Info */}
        <div className="mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-start space-x-3">
            <svg 
              className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <div className="text-left">
              <p className="text-sm font-medium text-blue-400 mb-1">
                Cached Content Available
              </p>
              <p className="text-xs text-gray-400">
                Some pages you've visited recently may still be accessible.
              </p>
            </div>
          </div>
        </div>

        {/* Connection Tips */}
        <div className="mt-6 text-left">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">
            Connection Tips:
          </h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Check your Wi-Fi or mobile data connection</li>
            <li>• Try moving to a different location</li>
            <li>• Restart your network connection</li>
            <li>• Contact your internet service provider</li>
          </ul>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}