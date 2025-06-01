'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  EnvelopeIcon,
  UserIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon,
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  CubeTransparentIcon,
  TagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface Message {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  projectType: string;
  budget: string;
  urgency: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  isRead: boolean;
  adminNotes?: string;
  createdAt: string;
  readAt?: string;
  repliedAt?: string;
}

export default function AdminMessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Auth check
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
          setFilteredMessages(data);
        } else {
          throw new Error('Mesajlar yüklenirken hata oluştu');
        }
      } catch (error) {
        console.error('Messages fetch error:', error);
        setError('Mesajlar yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchMessages();
    }
  }, [status]);

  // Filter messages
  useEffect(() => {
    let filtered = messages;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(message => message.status === statusFilter);
    }

    // Urgency filter
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(message => message.urgency === urgencyFilter);
    }

    setFilteredMessages(filtered);
  }, [messages, searchTerm, statusFilter, urgencyFilter]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);

    // Mark as read if not already
    if (!message.isRead) {
      try {
        const response = await fetch(`/api/messages/${message._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isRead: true,
            status: message.status === 'new' ? 'read' : message.status,
            wasRead: message.isRead
          }),
        });

        if (response.ok) {
          // Update local state
          setMessages(prev => prev.map(m => 
            m._id === message._id 
              ? { ...m, isRead: true, status: m.status === 'new' ? 'read' : m.status }
              : m
          ));
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleUpdateStatus = async (messageId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setMessages(prev => prev.map(m => 
          m._id === messageId ? { ...m, status: newStatus as any } : m
        ));
        setSuccess('Mesaj durumu güncellendi');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Durum güncellenemedi');
      }
    } catch (error) {
      setError('Durum güncellenirken hata oluştu');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages(prev => prev.filter(m => m._id !== messageId));
        setSuccess('Mesaj silindi');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Mesaj silinemedi');
      }
    } catch (error) {
      setError('Mesaj silinirken hata oluştu');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'read': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'replied': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'closed': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'urgent': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          <p className="text-slate-300">Mesajlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  const newMessagesCount = messages.filter(m => m.status === 'new').length;
  const unreadMessagesCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-400" />
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <CubeTransparentIcon className="w-6 h-6 text-white" />
                </div>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Mesajlar</h1>
                <p className="text-sm text-slate-300">Gelen proje talepleri ve mesajlar</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{session.user.name}</p>
                  <p className="text-xs text-slate-400">{session.user.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-xl transition-all duration-200 text-sm font-medium border border-red-500/30"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
                  <TagIcon className="w-8 h-8 text-teal-400" />
                  <span>Mesaj Yönetimi</span>
                </h2>
                <p className="text-slate-300 text-lg">
                  Gelen proje talepleri ve müşteri mesajları.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{messages.length}</p>
                  <p className="text-sm text-slate-300">Toplam</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{newMessagesCount}</p>
                  <p className="text-sm text-slate-300">Yeni</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-400">{unreadMessagesCount}</p>
                  <p className="text-sm text-slate-300">Okunmadı</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6">
            <div className="bg-green-500/10 backdrop-blur-xl border border-green-500/30 text-green-300 p-6 rounded-2xl flex items-center space-x-3">
              <CheckIcon className="w-6 h-6 text-green-400" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6">
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-red-300 p-4 rounded-2xl flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ad, email, konu ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-slate-300 hover:text-white transition-all duration-200"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filtreler</span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Durum</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    style={{
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <option value="all" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                      Tümü
                    </option>
                    <option value="new" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                      Yeni
                    </option>
                    <option value="read" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                      Okundu
                    </option>
                    <option value="replied" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                      Yanıtlandı
                    </option>
                    <option value="closed" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                      Kapatıldı
                    </option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Öncelik</label>
                  <select
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    style={{
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <option value="all" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                      Tümü
                    </option>
                    <option value="low" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                      Düşük
                    </option>
                    <option value="medium" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                      Orta
                    </option>
                    <option value="high" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                      Yüksek
                    </option>
                    <option value="urgent" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                      Acil
                    </option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20 text-center">
              <TagIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Henüz mesaj yok</h3>
              <p className="text-slate-400">
                {searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all'
                  ? 'Filtrelere uygun mesaj bulunamadı.'
                  : 'İlk proje talebi geldiğinde burada görünecek.'
                }
              </p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div 
                key={message._id}
                className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-200 ${
                  !message.isRead ? 'ring-2 ring-teal-500/50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{message.name}</p>
                          <p className="text-sm text-slate-400">{message.email}</p>
                        </div>
                      </div>
                      
                      {!message.isRead && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          Yeni
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2 truncate">
                      {message.subject}
                    </h3>
                    
                    <p className="text-slate-300 mb-4 line-clamp-2">
                      {message.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDate(message.createdAt)}</span>
                      </div>
                      
                      {message.phone && (
                        <div className="flex items-center space-x-1">
                          <PhoneIcon className="w-4 h-4" />
                          <span>{message.phone}</span>
                        </div>
                      )}
                      
                      {message.company && (
                        <div className="flex items-center space-x-1">
                          <BuildingOfficeIcon className="w-4 h-4" />
                          <span>{message.company}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <ClockIcon className={`w-4 h-4 ${getUrgencyColor(message.urgency)}`} />
                        <span className={getUrgencyColor(message.urgency)}>
                          {message.urgency === 'low' ? 'Düşük' : 
                           message.urgency === 'medium' ? 'Orta' :
                           message.urgency === 'high' ? 'Yüksek' : 'Acil'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3 ml-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(message.status)}`}>
                      {message.status === 'new' ? 'Yeni' :
                       message.status === 'read' ? 'Okundu' :
                       message.status === 'replied' ? 'Yanıtlandı' : 'Kapatıldı'}
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewMessage(message)}
                        className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors duration-200"
                        title="Görüntüle"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      
                      <select
                        value={message.status}
                        onChange={(e) => handleUpdateStatus(message._id, e.target.value)}
                        className="bg-white/5 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        style={{
                          color: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        <option value="new" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                          Yeni
                        </option>
                        <option value="read" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                          Okundu
                        </option>
                        <option value="replied" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                          Yanıtlandı
                        </option>
                        <option value="closed" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                          Kapatıldı
                        </option>
                      </select>
                      
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                        title="Sil"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Message Detail Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Mesaj Detayı</h3>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Ad Soyad</label>
                    <p className="text-white mt-1">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">E-posta</label>
                    <p className="text-white mt-1">{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <label className="text-sm font-medium text-slate-300">Telefon</label>
                      <p className="text-white mt-1">{selectedMessage.phone}</p>
                    </div>
                  )}
                  {selectedMessage.company && (
                    <div>
                      <label className="text-sm font-medium text-slate-300">Şirket</label>
                      <p className="text-white mt-1">{selectedMessage.company}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300">Konu</label>
                  <p className="text-white mt-1 text-lg font-semibold">{selectedMessage.subject}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300">Mesaj</label>
                  <div className="mt-2 p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-white whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Proje Türü</label>
                    <p className="text-white mt-1">
                      {selectedMessage.projectType === '3d-design' ? '3D Tasarım' :
                       selectedMessage.projectType === 'reverse-engineering' ? 'Tersine Mühendislik' :
                       selectedMessage.projectType === '3d-printing' ? '3D Baskı' :
                       selectedMessage.projectType === 'cad-design' ? 'CAD Tasarım' :
                       selectedMessage.projectType === 'consulting' ? 'Danışmanlık' : 'Diğer'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Bütçe</label>
                    <p className="text-white mt-1">
                      {selectedMessage.budget === 'under-5k' ? '5.000 TL altı' :
                       selectedMessage.budget === '5k-15k' ? '5.000 - 15.000 TL' :
                       selectedMessage.budget === '15k-50k' ? '15.000 - 50.000 TL' :
                       selectedMessage.budget === '50k-100k' ? '50.000 - 100.000 TL' :
                       selectedMessage.budget === 'above-100k' ? '100.000 TL üzeri' : 'Belirtilmedi'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Öncelik</label>
                    <p className={`mt-1 font-medium ${getUrgencyColor(selectedMessage.urgency)}`}>
                      {selectedMessage.urgency === 'low' ? 'Düşük' : 
                       selectedMessage.urgency === 'medium' ? 'Orta' :
                       selectedMessage.urgency === 'high' ? 'Yüksek' : 'Acil'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-slate-400">
                    Gönderilme: {formatDate(selectedMessage.createdAt)}
                  </p>
                  {selectedMessage.readAt && (
                    <p className="text-sm text-slate-400">
                      Okunma: {formatDate(selectedMessage.readAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 