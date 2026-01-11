'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ChatBubbleLeftRightIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ContactSetting {
  email: string;
  phone: string;
  address: string;
  socialLinks: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export default function AdminContactPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settings, setSettings] = useState<ContactSetting>({
    email: '',
    phone: '',
    address: '',
    socialLinks: {}
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    if (session?.user?.role !== 'admin') {
      router.push('/admin/dashboard');
      return;
    }

    loadSettings();
  }, [status, session, router]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/contact');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading contact settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Contact settings saved successfully!' });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">Loading contact settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contact Settings</h1>
          <p className="text-slate-500 mt-1">Manage your contact information</p>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-xl border ${
          message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Contact Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Contact Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Address
            </label>
            <textarea
              value={settings.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              placeholder="Your business address"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Social Media Links</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Twitter
            </label>
            <input
              type="url"
              value={settings.socialLinks.twitter || ''}
              onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="https://twitter.com/yourhandle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Facebook
            </label>
            <input
              type="url"
              value={settings.socialLinks.facebook || ''}
              onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              value={settings.socialLinks.linkedin || ''}
              onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Instagram
            </label>
            <input
              type="url"
              value={settings.socialLinks.instagram || ''}
              onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="https://instagram.com/yourhandle"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckIcon className="w-5 h-5" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
