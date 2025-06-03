'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '../../../components/ImageUpload';
import {
  UserIcon,
  KeyIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CogIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

interface SettingsData {
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  siteUrl: string;
  logo: string;
  favicon: string;
  ogImage: string;
  twitterHandle: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  adminSettings: {
    defaultLanguage: string;
    timezone: string;
    dateFormat: string;
    enableNotifications: boolean;
  };
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxUploadSize: number;
}

interface SiteSettings {
  _id?: string;
  siteName: string;
  slogan: string;
  description: string;
  logo: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface MediaItem {
  _id?: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploader?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Settings State
  const [settingsData, setSettingsData] = useState<SettingsData>({
    siteName: '',
    siteTitle: '',
    siteDescription: '',
    siteKeywords: '',
    siteUrl: '',
    logo: '',
    favicon: '',
    ogImage: '',
    twitterHandle: '',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    adminSettings: {
      defaultLanguage: 'tr',
      timezone: 'Europe/Istanbul',
      dateFormat: 'DD/MM/YYYY',
      enableNotifications: true,
    },
    maintenanceMode: false,
    allowRegistration: false,
    maxUploadSize: 10,
  });

  // Brand Settings State
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [brandFormData, setBrandFormData] = useState({
    siteName: '',
    slogan: '',
    logoUrl: ''
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Name Change State
  const [nameData, setNameData] = useState({
    newName: '',
    currentPassword: ''
  });

  // User Management State
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  // Email Change State
  const [emailData, setEmailData] = useState({
    newEmail: '',
    currentPassword: ''
  });

  // Media Management State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [mediaFilter, setMediaFilter] = useState('all');
  const [mediaSortBy, setMediaSortBy] = useState('date');
  const [mediaSearchTerm, setMediaSearchTerm] = useState('');
  const [deletingMedia, setDeletingMedia] = useState(false);

  // UI States
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [changingName, setChangingName] = useState(false);
  const [changingUser, setChangingUser] = useState(false);
  const [changingBrand, setChangingBrand] = useState(false);
  const [changingSettings, setChangingSettings] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
    emailCurrent: false
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white text-xl">Admin Ayarları yükleniyor...</p>
      </div>
    </div>
  );
} 